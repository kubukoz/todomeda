import List from "@mui/material/List"
import Typography from "@mui/material/Typography"
import Box from "@mui/system/Box"
import { useEffect, useState } from "react"
import { TaskComponent } from "./Task"
import { switchTask, Task } from "../types/types"
import { Button } from "@mui/material"

type Props = {
  fetchTasks: () => Promise<readonly Task[]>
  upsertTasks: (tasks: readonly Task[]) => Promise<void>
  moreTasks: () => Promise<readonly Task[]>
}

export const TaskList: React.FC<Props> = ({
  fetchTasks,
  upsertTasks,
  moreTasks,
}) => {
  const [tasks, setTasks] = useState([] as readonly Task[])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // todo: proper loader
    setLoading(true)

    fetchTasks().then((tasks) => {
      setTasks(tasks)
      setLoading(false)
    })
  }, [setTasks, setLoading])

  const onTaskClick = (task: Task) => () => {
    const newTasks = tasks.map((t) => {
      if (t.id === task.id) return switchTask(t)
      else return t
    })

    setTasks(newTasks)
    upsertTasks(newTasks)
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
      <Button onClick={() => moreTasks().then(setTasks)}>Give me more</Button>
    </Box>
  )
}
