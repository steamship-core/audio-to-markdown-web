// Y'all, please play nice.

import { v4 as uuidv4 } from 'uuid';
import { apiPost, appPost } from '../../components/steamship'

const uploadContent = async (content) => {
  const filePath = `${uuidv4()}.webm`;

  let writeResp = await apiPost('space/createSignedUrl', {
    bucket: 'userData',
    filepath: filePath,
    operation: 'Write'
  }) 

  let uploadResp = await fetch(writeResp.data.signedUrl, {
    method: "PUT",
    body: content,
   }
  );

  let readResp = await apiPost('space/createSignedUrl', {
    bucket: 'userData',
    filepath: filePath,
    operation: 'Read'
  }) 

  return readResp.data.signedUrl;
  // return "https://api.webm.to/static/downloads/c0b449c32c9e4b4f9444167dcc1bcd1d/markdown_test_4.webm";
}

const startTranscribe = async (url) => {
  let resp = await appPost('transcribe_url', {
    url: url
  });
  console.log("resp", resp);
  return resp.task_id
}

export default async function handler(req, res) {
  try {
    const body = await Buffer(req.body);
    let uploadUrl = await uploadContent(body)
    let task_id = await startTranscribe(uploadUrl)
    console.log("task_id: ", task_id)
    res.status(200).json({ task_id })
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: 'failed to load data' })
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '60mb',
      bodyParser: false,
      responseLimit: false,
    },
  },
}