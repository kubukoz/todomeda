import AppBar from "@mui/material/AppBar"
import List from "@mui/material/List"
import Toolbar from "@mui/material/Toolbar"
import Typography from "@mui/material/Typography"
import Box from "@mui/system/Box"
import { useEffect, useState } from "react"
import { TaskComponent } from "./components/Task"
import { switchTask, Task, User, UserRef } from "./types/types"
import { initializeApp } from "firebase/app"

import {
  initializeAuth,
  browserLocalPersistence,
  browserPopupRedirectResolver,
  browserSessionPersistence,
  indexedDBLocalPersistence,
  signInWithRedirect,
  GithubAuthProvider,
  getRedirectResult,
  onAuthStateChanged,
} from "firebase/auth"

import {
  getFirestore,
  collection,
  QueryDocumentSnapshot,
  SnapshotOptions,
  getDoc,
  doc,
  setDoc,
} from "firebase/firestore"
import { TaskList } from "./components/TaskList"

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

const userDocRef = (user: UserRef) => doc(usersFs, user.uid)

const getUser = async (user: UserRef): Promise<User | undefined> => {
  const result = await getDoc(userDocRef(user))
  return result.data()
}

const createUser = async (userRef: UserRef, user: User) => {
  await setDoc(userDocRef(userRef), user)
}

const fetchTasks = async (userRef: UserRef): Promise<readonly Task[]> => {
  const existingUser = await getUser(userRef)

  if (existingUser) {
    return existingUser.tasks
  } else {
    const tasks = initTasks()
    await createUser(userRef, {
      tasks,
    } as User)

    return tasks
  }
}

const auth = initializeAuth(firebaseApp, {
  persistence: [
    indexedDBLocalPersistence,
    browserLocalPersistence,
    browserSessionPersistence,
  ],
  popupRedirectResolver: browserPopupRedirectResolver,
})

const useCurrentUser = () => {
  const [user, setUser] = useState<typeof auth.currentUser>(null)

  useEffect(() => {
    const cancel = auth.onAuthStateChanged((u) => {
      setUser(u)
    })

    return () => cancel()
  }, [onAuthStateChanged, setUser])

  return user
}
const App: React.FC = () => {
  const userRef = useCurrentUser()

  const doLogin = () => {
    signInWithRedirect(
      auth,
      new GithubAuthProvider(),
      browserPopupRedirectResolver,
    )
  }

  return userRef ? (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div">
              Today&apos;s tasks for {userRef.displayName}
            </Typography>
          </Toolbar>
        </AppBar>
      </Box>
      <TaskList fetchTasks={() => fetchTasks(userRef)} />
    </>
  ) : (
    <>
      <button onClick={doLogin}>Login with github</button>
    </>
  )
}

export default App
