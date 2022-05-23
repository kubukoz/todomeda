import AppBar from "@mui/material/AppBar"
import Button from "@mui/material/Button"
import Toolbar from "@mui/material/Toolbar"
import Typography from "@mui/material/Typography"
import Box from "@mui/system/Box"
import { useEffect, useState } from "react"
import { Task, User, UserRef, UserState } from "./types/types"
import { initializeApp } from "firebase/app"

import {
  initializeAuth,
  browserLocalPersistence,
  browserPopupRedirectResolver,
  browserSessionPersistence,
  indexedDBLocalPersistence,
  signInWithRedirect,
  GithubAuthProvider,
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
  updateDoc,
  arrayUnion,
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

const fetchOrCreateTasks = async (
  userRef: UserRef,
): Promise<readonly Task[]> => {
  const existingUser = await getUser(userRef)

  if (existingUser) {
    return existingUser.tasks
  } else {
    const tasks = initTasks()
    await createUser(userRef, { tasks })

    return tasks
  }
}

const upsertTasks = (userRef: UserRef, tasks: readonly Task[]) => {
  return updateDoc(userDocRef(userRef), { tasks })
}

const moreTasks = async (userRef: UserRef) => {
  const newTasks = initTasks()
  await upsertTasks(userRef, newTasks)
  return newTasks
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
  const [user, setUser] = useState<UserState<UserRef>>({ state: "unknown" })

  useEffect(() => {
    const cancel = auth.onAuthStateChanged((u) => {
      setUser(u ? { state: "authed", value: u } : { state: "unauthed" })
    })

    return () => cancel()
  }, [onAuthStateChanged, setUser])

  return user
}

const doLogin = () => {
  signInWithRedirect(auth, new GithubAuthProvider()).catch((e) => {
    window.alert(JSON.stringify(e))
    console.log(e)
  })
}

const App: React.FC = () => {
  const userRef = useCurrentUser()

  switch (userRef.state) {
    case "authed":
      return (
        <>
          <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
              <Toolbar>
                <Typography variant="h6" component="div">
                  Today&apos;s tasks for {userRef.value.displayName}
                </Typography>
              </Toolbar>
            </AppBar>
          </Box>
          <TaskList
            fetchTasks={() => fetchOrCreateTasks(userRef.value)}
            upsertTasks={(tasks) => upsertTasks(userRef.value, tasks)}
            moreTasks={() => moreTasks(userRef.value)}
          />
        </>
      )
    case "unauthed":
      return (
        <>
          <Button onClick={doLogin}>Login with github</Button>
        </>
      )
    case "unknown":
      return <>Fetching user...</>
  }
}

export default App
