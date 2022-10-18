import React, { Component } from 'react';
import AudioAnalyser from './AudioAnalyser';
import { RecordButton } from './RecordButton';
import clsx from 'clsx'
import { PauseIcon, RecordIcon } from "./RecordButton"
import ReactMarkdown from 'react-markdown'
import { useState, useEffect } from 'react'

const PAUSED = "PAUSED"
const RECORDING = "RECORDING"

const UPLOADING = "UPLOADING"
const PROCESSING = "PROCESSING"
const PROCESSED = "PROCESSED"

export default function Recorder() {
  let [audio, setAudio] = useState(null);
  let [recording, setRecording] = useState(false);
  let [recorder, setRecorder] = useState(null);
  let [chunks, setChunks] = useState([]);
  let [size, setSize] = useState(0);
  let [taskId, setTaskId] = useState(null);
  let [state, setState] = useState(PAUSED);

  const onAudio = (event) => {
    setChunks([...chunks, event.data]);
  }

  const checkTask = async () => {
    let uploadResp = await fetch("/api/get_markdown", {
        headers: {
            'Content-Type': 'application/json',   
        },
       method: "POST",
       body: JSON.stringify({ task_id: taskId }),
      }
    );    
    let r = await uploadResp.json();
    if (r && r.status == "succeeded") {
      setState(PROCESSED)
      setMarkdown(r.markdown)
    }
  }
 
  const SECONDS = 0.5;
  useEffect(() => {
    const timer = setInterval(() => {
      if (state != PROCESSING) {
        return;
      }
      if (!taskId) {
        console.log("Error: empty Task ID")
        return
      }
      checkTask();
    }, SECONDS * 1000);
    return () => clearInterval(timer);
  }, []);


  const processBlob = async (blob) => {
    setState(UPLOADING)
   let uploadResp = await fetch("/api/transcribe", {
      method: "POST",
      body: blob,
     }
    );
    let task_id = (await uploadResp.json()).task_id;
    setTaskId(task_id);
    setState(PROCESSING)
  }

  const processChunks = async () => {
    var blob = new Blob(chunks, { type: 'audio/webm' });
    await processBlob(blob)
  }

  const getMicrophone = async () => {
    const audio = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false
    });
    setAudio(audio)
    setRecording(true)
    setState(RECORDING);
    setChunks([])

    // https://remarkablemark.org/blog/2021/01/02/record-microphone-audio-on-webpage/
    let mediaRecorder = new MediaRecorder(audio)
    mediaRecorder.addEventListener('dataavailable', onAudio);

    mediaRecorder.addEventListener('stop', async function () {
      await processChunks();
    });
    mediaRecorder.start();

    // Note: technically this is a memory leak since we don't remove the listener when they hit stop..
    setRecorder(mediaRecorder)
  }

  const stopMicrophone = () => {
    audio.getTracks().forEach(track => track.stop());
    setAudio(null)
    setRecording(false)

    recorder.stop()
    recorder.removeEventListener('dataavailable', onAudio)

    setRecorder(null);
    setChunks([]);
  }

  const toggleMicrophone = () => {
    if (audio) {
      stopMicrophone();
    } else {
      getMicrophone();
    }
  }

  const renderContent = () => {
    switch (state) {
      case PAUSED:
        return (<div>Press Record to begin recording.</div>)
      case RECORDING:
        return (<div>Recording... Processing will begin when you press stop.</div>)
      case UPLOADING:
        return (<div>Uploading audio...</div>)
      case PROCESSING:
        return (<div>Processing audio...</div>)      
    }

    let markdown = `    
foo bar 
# bar

grocery list 
1. sandwiches 
2. cheese sticks 
3. fruit snacks 
the end

grocery list 
* sandwiches 
* cheese sticks 
* fruit snacks 
the end

# This is the first heading 
## This is the second heading 
### This is the third heading 
#### This is the fourth heading 
##### This is the fifth heading 
###### This is the sixth heading
    `    
    return (
      <React.Fragment>
        <hr className="my-12 border-gray-200" />
        <div
          className="prose prose-slate mt-14 [&>h2]:mt-12 [&>h2]:flex [&>h2]:items-center [&>h2]:font-mono [&>h2]:text-sm [&>h2]:font-medium [&>h2]:leading-7 [&>h2]:text-slate-900 [&>h2]:before:mr-3 [&>h2]:before:h-3 [&>h2]:before:w-1.5 [&>h2]:before:rounded-r-full [&>h2]:before:bg-cyan-200 [&>ul]:mt-6 [&>ul]:list-['\2013\20'] [&>ul]:pl-5 [&>h2:nth-of-type(3n+2)]:before:bg-indigo-200 [&>h2:nth-of-type(3n)]:before:bg-violet-200"
        >
          <ReactMarkdown children={markdown} />
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
            aria-label={recording ? 'Pause' : 'Record'}
          >
            <div className="absolute -inset-3 md:hidden" />
            {recording ? (
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
            {recording ? "Click Pause to Stop" : "Click Record to Begin"}
          </p>
        </header>
        <hr className="my-12 border-gray-200" />
        {audio ? <AudioAnalyser audio={audio} /> : ''}
        {renderContent()}
      </React.Fragment>
    )
  }

  return render()
}
