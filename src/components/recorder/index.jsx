import React, { Component } from 'react';
import AudioAnalyser from './AudioAnalyser';
import { RecordButton } from './RecordButton';
import clsx from 'clsx'
import { PauseIcon, RecordIcon } from "./RecordButton"
import ReactMarkdown from 'react-markdown'
import { useState, useEffect, useRef } from 'react'
import {useInterval} from "../useInterval"
import { useMediaRecorder } from './use-media-recorder';

const PAUSED = "PAUSED"
const RECORDING = "RECORDING"

const UPLOADING = "UPLOADING"
const PROCESSING = "PROCESSING"
const PROCESSED = "PROCESSED"

const MESSAGES = {
  [PAUSED]: "Click Record to begin.",
  [RECORDING]: "Uploading audio to Steamship..",
  [UPLOADING]: "Transcribing and converting to Markdown..",
  [PROCESSING]: "Transcription complete.",
  [PROCESSED]: "Processed."
}

const TASK_CHECK_INTERVAL_SECONDS = 0.5;

export default function Recorder() {
  // let [audio, setAudio] = useState(null);
  // let [recording, setRecording] = useState(false);
  // let [recorder, setRecorder] = useState(null);
  // let [chunks, setChunks] = useState([]);
  // let [size, setSize] = useState(0);

  const recordingRef = useRef(null)
  const [isRecording, setIsRecording] = useState(false)
  const [setCaptureRef, data, stream, recorder, err] = useMediaRecorder({ isRecording, audioOnly: true })
  const [taskId, setTaskId] = useState(null);
  const [state, setState] = useState(PAUSED);
  const [markdown, setMarkdown] = useState(null);

  const showButton = ((state == PAUSED) || (state == RECORDING))

  const checkTask = async () => {
    console.log(`Checking status of ${taskId}`)
    let uploadResp = await fetch("/api/get_markdown", {
        headers: {
            'Content-Type': 'application/json',   
        },
       method: "POST",
       body: JSON.stringify({ task_id: taskId }),
      }
    );    
    let r = await uploadResp.json();
    console.log(`...${r.status}`)
    if (r && r.status == "succeeded") {
      setState(PROCESSED)
      setMarkdown(r.markdown)
    } else if (r && r.status == "failed") {
      setState(PROCESSED)
      let msg = JSON.stringify(r.status, undefined, 2);
      let lines = msg.split('\n')
      for (var i = 0; i < lines.length; i++) {
        lines[i] = `    ${lines[i]}`
      }
      setMarkdown(lines.join('\n'))
    }
  }
 
  useInterval(() => {
    if (state != PROCESSING) {
      return;
    }
    if (!taskId) {
      console.log("Error: empty Task ID")
      return
    }
    checkTask();
  }, TASK_CHECK_INTERVAL_SECONDS * 1000)

  useEffect(() => {
    if (data == null) {
      return
    }

    // Process the data!
    var blob = new Blob(data, { type: 'audio/webm' });
    setState(UPLOADING)

    const postTranscribe = async () => {
      let uploadResp = await fetch("/api/transcribe", {
        method: "POST",
        body: blob,
      });
      let resp = (await uploadResp.json());
      console.log("Got task id", resp.task_id);
      setTaskId(resp.task_id);
      setState(PROCESSING)
    }
    postTranscribe().catch(console.error);
  }, [data]);

  const startRecording = async () => {
  // const audio = await navigator.mediaDevices.getUserMedia({
    //   audio: true,
    //   video: false
    // });
    // setAudio(audio)
    setIsRecording(true)
    setState(RECORDING);
    // setChunks([])
    setMarkdown(null);
    setTaskId(null);
    // https://remarkablemark.org/blog/2021/01/02/record-microphone-audio-on-webpage/
    // let mediaRecorder = new MediaRecorder(audio)
    // mediaRecorder.addEventListener('dataavailable', onAudio);

    // mediaRecorder.addEventListener('stop', async function () {
    //   await processChunks();
    // });
    // mediaRecorder.start();

    // Note: technically this is a memory leak since we don't remove the listener when they hit stop..
    // setRecorder(mediaRecorder)
  }

  const stopRecording = () => {
    // audio.getTracks().forEach(track => track.stop());
    // setAudio(null)
    setIsRecording(false)

    // recorder.stop()
    // recorder.removeEventListener('dataavailable', onAudio)

    // setRecorder(null);
    // setChunks([])
    // processChunks();
  }

  const toggleMicrophone = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }

  const renderContent = () => {
    if (state != PROCESSED) {
      return (
        <React.Fragment>
          <audio autoPlay muted ref={setCaptureRef} id='capture-audio' />
          <hr className="my-12 border-gray-200" />
          <div
            className="prose prose-slate mt-14 [&>h2]:mt-12 [&>h2]:flex [&>h2]:items-center [&>h2]:font-mono [&>h2]:text-sm [&>h2]:font-medium [&>h2]:leading-7 [&>h2]:text-slate-900 [&>h2]:before:mr-3 [&>h2]:before:h-3 [&>h2]:before:w-1.5 [&>h2]:before:rounded-r-full [&>h2]:before:bg-cyan-200 [&>ul]:mt-6 [&>ul]:list-['\2013\20'] [&>ul]:pl-5 [&>h2:nth-of-type(3n+2)]:before:bg-indigo-200 [&>h2:nth-of-type(3n)]:before:bg-violet-200"
          >
            <p>While recording, you can say things like:</p>
            <ReactMarkdown>{`
            
              
            Heading 1. 
                My Shopping List. 
            Finish Element.

            Here are some things I'd like to pick up from the store:

            Numbered List.
                Some apples. Finish Item.
                Some pie crust. Finish Item.
                Vanilla ice cream. Finish Item.
            Finish Element.
            `}</ReactMarkdown>
          </div>
        </React.Fragment>
      )
    }

    return (
      <React.Fragment>
        <hr className="my-12 border-gray-200" />
        <div
          className="prose prose-slate mt-14 [&>h2]:mt-12 [&>h2]:flex [&>h2]:items-center [&>h2]:font-mono [&>h2]:text-sm [&>h2]:font-medium [&>h2]:leading-7 [&>h2]:text-slate-900 [&>h2]:before:mr-3 [&>h2]:before:h-3 [&>h2]:before:w-1.5 [&>h2]:before:rounded-r-full [&>h2]:before:bg-cyan-200 [&>ul]:mt-6 [&>ul]:list-['\2013\20'] [&>ul]:pl-5 [&>h2:nth-of-type(3n+2)]:before:bg-indigo-200 [&>h2:nth-of-type(3n)]:before:bg-violet-200"
        >
          <ReactMarkdown>{markdown}</ReactMarkdown>
        </div>
      </React.Fragment>
    )
  }

  const renderRecorder = () => {
    let size = 'large'
    
    return (
      <div className="App">
        <div className="controls">
          <button
            type="button"
            className={clsx(
              'group relative flex flex-shrink-0 items-center justify-center rounded-full bg-slate-700 hover:bg-slate-900 focus:outline-none focus:ring-slate-700',
              {
                large: 'h-18 w-18 focus:ring focus:ring-offset-4',
                medium: 'h-14 w-14 focus:ring-2 focus:ring-offset-2',
                small: 'h-10 w-10 focus:ring-2 focus:ring-offset-2',
              }[size]
            )}
            onClick={toggleMicrophone}
            aria-label={isRecording ? 'Pause' : 'Record'}
          >
            <div className="absolute -inset-3 md:hidden" />
            {isRecording ? (
              <PauseIcon
                className={clsx(
                  'fill-white group-active:fill-white/80',
                  {
                    large: 'h-7 w-7',
                    medium: 'h-5 w-5',
                    small: 'h-4 w-4',
                  }[size]
                )}
              />
            ) : (
              <RecordIcon
                className={clsx(
                  'fill-white group-active:fill-white/80',
                  {
                    large: 'h-9 w-9',
                    medium: 'h-7 w-7',
                    small: 'h-5 w-5',
                  }[size]
                )}
              />
            )}
          </button>
              
        </div>
      </div>
    );
  }

  const render = () => {
    return (
      <React.Fragment>
        <header className="flex flex-col">
          <div className="flex items-center gap-6">
            {renderRecorder()}
            <div className="flex flex-col">
              <h1 className="mt-2 text-4xl font-bold text-slate-900">
                Audio to Markdown Demo
              </h1>
            </div>
          </div>
          <p className="ml-24 mt-3 text-lg font-medium leading-8 text-slate-700">
            {MESSAGES[state] || "Unknown State"}
          </p>
        </header>
        {isRecording && (
          <React.Fragment>
            <hr className="my-12 border-gray-200" />
            { stream && Object.keys(stream).length && (
              <AudioAnalyser audio={stream} /> 
            )}
          </React.Fragment>
        )}
        {renderContent()}
      </React.Fragment>
    )
  }

  return render()
}
