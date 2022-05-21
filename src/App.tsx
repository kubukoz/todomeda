import { AppBar, List, Toolbar, Typography } from "@mui/material"
import { Box } from "@mui/system"
import { useState } from "react"
import { TaskComponent } from "./components/Task"
import { switchTask, Task } from "./types/types"

const morningTasks: readonly Task[] = [
  { id: "t1", label: "Get up" },
  { id: "t2", label: "Weigh yourself" },
  { id: "t3", label: "Brush teeth" },
  { id: "t4", label: "Take shower" },
  { id: "t5", label: "Make breakfast" },
  { id: "t6", label: "Eat breakfast" },
  { id: "t7", label: "Take meds" },
]

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState(morningTasks)

  const onTaskClick = (task: Task) => () => {
    setTasks(
      tasks.map((t) => {
        if (t.id === task.id) return switchTask(t)
        else return t
      }),
    )
  }

  const pendingTasks = tasks.filter((t) => !t.done)

  return pendingTasks.length ? (
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
