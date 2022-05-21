export type Task = {
  id: string
  label: string
  done?: boolean
}

export const switchTask = (task: Task): Task => {
  return { ...task, done: !task.done }
}
