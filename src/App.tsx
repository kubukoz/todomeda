import AppBar from "@mui/material/AppBar"
import List from "@mui/material/List"
import Toolbar from "@mui/material/Toolbar"
import Typography from "@mui/material/Typography"
import Box from "@mui/system/Box"
import { useEffect, useState } from "react"
import { TaskComponent } from "./components/Task"
import { switchTask, Task, User } from "./types/types"
import { initializeApp } from "firebase/app"
import {
  getFirestore,
  addDoc,
  collection,
  query,
  getDocs,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  DocumentData,
  orderBy,
  getDoc,
  doc,
  setDoc,
} from "firebase/firestore"

const firebaseApp = initializeApp({
  apiKey: "AIzaSyA9It4T2AsoNUqG93gGdyOgrQE1fggUVPo",
  authDomain: "todomeda-d9195.firebaseapp.com",
  projectId: "todomeda-d9195",
  storageBucket: "todomeda-d9195.appspot.com",
  messagingSenderId: "363901814016",
  appId: "1:363901814016:web:42a35d6f593cb9ca55dfe5",
  measurementId: "G-G1S8V0WRXL",
})

const fs = getFirestore(firebaseApp)

const usersFs = collection(fs, "users").withConverter({
  fromFirestore: (snapshot: QueryDocumentSnapshot, _: SnapshotOptions) =>
    snapshot.data() as User,
  toFirestore: (data) => data,
})

type TaskNoId = Omit<Task, "id">

const makeTask = (task: TaskNoId): Task => ({
  id: crypto.randomUUID(),
  ...task,
})

const initTasks = (): readonly Task[] =>
  [
    { label: "Get up" },
    { label: "Weigh yourself" },
    { label: "Brush teeth" },
    { label: "Take shower" },
    { label: "Make breakfast" },
    { label: "Eat breakfast" },
    { label: "Take meds" },
  ].map(makeTask)

const userDocRef = doc(usersFs, "kubukoz")

const getUser = async (): Promise<User | undefined> => {
  const result = await getDoc(userDocRef)
  return result.data()
}

const createUser = async (user: User) => {
  await setDoc(userDocRef, user)
}

const fetchTasks = async (
  setTasks: (tasks: readonly Task[]) => void,
  setLoading: (loading: boolean) => void,
) => {
  const existingUser = await getUser()

  if (existingUser) {
    setTasks(existingUser.tasks)
  } else {
    const tasks = initTasks()
    await createUser({ tasks } as User)
    setTasks(tasks)
  }

  setLoading(false)
}

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState([] as readonly Task[])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTasks(setTasks, setLoading)
  }, [setTasks, setLoading])

  const onTaskClick = (task: Task) => () => {
    setTasks(
      tasks.map((t) => {
        if (t.id === task.id) return switchTask(t)
        else return t
      }),
    )
  }

  const pendingTasks = tasks.filter((t) => !t.done)

  return loading ? (
    <Box padding={"20px"}>
      <Typography variant="h3">Loading...</Typography>
    </Box>
  ) : pendingTasks.length ? (
    <List>
      {pendingTasks.map((task) => (
        <Box sx={{ display: "flex" }} key={task.id}>
          <TaskComponent task={task} handleClick={onTaskClick} />
        </Box>
      ))}
    </List>
  ) : (
    <Box padding={"20px"}>
      <Typography variant="h3">All done for now!</Typography>
    </Box>
  )
}

const App: React.FC = () => {
  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div">
              Today&apos;s tasks
            </Typography>
          </Toolbar>
        </AppBar>
      </Box>
      <TaskList />
    </>
  )
}

export default App
