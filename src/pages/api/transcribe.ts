// Y'all, please play nice.

import { v4 as uuidv4 } from 'uuid';
import {getSteamship} from '../../components/steamship'
import { writeFileSync } from "fs"
import { promises as fs } from 'fs'
import middleware from '../../middleware/middleware'
import nextConnect from 'next-connect';

const uploadContent = async (content) => {
  const filePath = `${uuidv4()}.webm`;
  const ship = getSteamship()

  let writeResp = await ship.post('workspace/createSignedUrl', {
    bucket: 'userData',
    filepath: filePath,
    operation: 'Write'
  }) as any

  let uploadResp = await fetch(writeResp.data.signedUrl, {
    method: "PUT",
    body: content,
   }
  );

  let readResp = await ship.post('workspace/createSignedUrl', {
    bucket: 'userData',
    filepath: filePath,
    operation: 'Read'
  }) as any

  console.log(readResp.data.signedUrl)
  return readResp.data.signedUrl;
}

const startTranscribe = async (url) => {
  let resp = await appPost('transcribe_url', {
    url: url
  });
  console.log("resp", resp);
  return resp.task_id
}

const handler = nextConnect();
handler.use(middleware);
handler.post(async(req: any, res: any) => {
  try {
		const files = req.files
		const body = req.body

    const data = await fs.readFile(files.content.filepath)
    let uploadUrl = await uploadContent(data)
    let task_id = await startTranscribe(uploadUrl)
    console.log("task_id: ", task_id)
    res.status(200).json({ task_id })
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: 'failed to load data' })
  }
})

export const config = {
  api: {
    bodyParser: false
  },
}

export default handler;