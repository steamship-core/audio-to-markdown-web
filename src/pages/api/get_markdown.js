// Y'all, please play nice.

import { v4 as uuidv4 } from 'uuid';
import { apiPost, appPost } from '../../components/steamship'

const get_result = async (task_id) => {
  let resp = await appPost('get_markdown', {
    task_id: task_id,
  });
  return resp
}

export default async function handler(req, res) {
  try {
    // console.log("JSON", req.body.json());
    const task_id = req.body.task_id;
    console.log("task id", task_id);
    res.status(200).json(await get_result(task_id))
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: 'failed to load data' })
  }
}

