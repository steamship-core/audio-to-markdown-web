import { getApp } from '../../components/steamship'

interface IGetMarkdownResponse {
  markdown: any,
  status: any
}

async function get_result(task_id: string): Promise<IGetMarkdownResponse> {
  let app = await getApp()
  let resp = await app.invoke('get_markdown', {
    task_id: task_id,
  });
  return resp.data as IGetMarkdownResponse
}

export default async function handler(req, res) {
  try {
    const task_id = req.body.task_id;
    const body = await get_result(task_id)
    if (body.status == "failed") {
      console.log(body)
    }
    res.status(200).json(body)
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: 'failed to load data' })
  }
}

