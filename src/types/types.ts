import fauth from "firebase/auth"

export type Task = {
  id: string
  label: string
  done?: boolean
}

export const switchTask = (task: Task): Task => {
  return { ...task, done: !task.done }
}

export type User = {
  tasks: readonly Task[]
}

export type UserRef = Pick<fauth.User, "uid" | "displayName">

export type UserState<T> =
  | { state: "unknown" }
  | { state: "unauthed" }
  | { state: "authed"; value: T }
