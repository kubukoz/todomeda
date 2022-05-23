import Checkbox from "@mui/material/Checkbox"
import ListItem from "@mui/material/ListItem"
import ListItemButton from "@mui/material/ListItemButton"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import { Task } from "../types/types"

type Props = {
  task: Task
  handleClick: (task: Task) => () => void
}

export const TaskComponent: React.FC<Props> = (props) => {
  const task = props.task
  const handleClick = props.handleClick

  return (
    <ListItem disablePadding>
      <ListItemButton role={undefined} onClick={handleClick(task)}>
        <ListItemIcon>
          <Checkbox
            edge="start"
            checked={task.done === true}
            tabIndex={-1}
            disableRipple
          ></Checkbox>
        </ListItemIcon>
        <ListItemText primary={task.label} />
      </ListItemButton>
    </ListItem>
  )
}
