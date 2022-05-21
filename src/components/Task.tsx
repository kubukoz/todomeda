import {
  Checkbox,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material"
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
