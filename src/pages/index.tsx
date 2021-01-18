import React from "react";
import { useQuery, useMutation } from '@apollo/client';
import gql from 'graphql-tag'
import styles from './index.module.css'
import DeleteIcon from '@material-ui/icons/Delete';
import UpdateIcon from '@material-ui/icons/Update';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Modal, TextField, Button, ListItemSecondaryAction } from '@material-ui/core'
import Loader from '../components/loader'

// This query is executed at run time by apolloClient
const GET_TODOS = gql`
{
  todos {
    id,
    task,
    
  }
}
`;

const ADD_TODO = gql`
  mutation addTodo($task:String!){
    addTodo(task: $task){
     
      task,
    }
  }
`;

const DELETE_TODO = gql`
  mutation deleteTodo($id: ID!){
    deleteTodo(id: $id){
      id
    }
  }
`;

const UPDATE_TODO = gql`
  mutation updateTodo($id:ID!, $task:String!){
    updateTodo(id: $id, task: $task){
      id
    }
  }
`

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      textAlign: 'center',
    },
    parent: {
      textAlign: 'center'
    },
    dataDisplay: {
      backgroundColor: '#eeeeee',
      marginBottom: '10px'
    },
    textField: {
      width: '100%',
      textAlign: 'center',
    },
    paper: {
      position: 'absolute',
      width: 400,
      backgroundColor: theme.palette.background.paper,
      border: '2px solid #000',
      boxShadow: theme.shadows[5],
      padding: theme.spacing(2, 4, 3),
    },
  }),
);

function rand() {
  return Math.round(Math.random() * 20) - 10;
}

function getModalStyle() {
  const top = 40 + rand();
  const left = 50 + rand();

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

export default function Home() {
  const classes = useStyles();


  // Modal
  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };


  // Work For Add Todos

  const [addTodo] = useMutation(ADD_TODO);
  const [deleteTodo] = useMutation(DELETE_TODO);
  const [updateTodo] = useMutation(UPDATE_TODO)
  const [open, setOpen] = React.useState(false);
  const [modalStyle] = React.useState(getModalStyle);
  const [updateId, setUpdateId] = React.useState('')
  const [updateInput, setUpdateInput] = React.useState('')
  const [input, setInput] = React.useState('')

  const addTask = () => {
    addTodo({
      variables: {
        task: input
      },
      refetchQueries: [{ query: GET_TODOS }]
    });
    setInput('')
  }

  // Work for Get Todos
  const { loading, error, data } = useQuery(GET_TODOS)

  console.log('data', data)
  if (loading) {
    return(
      <div className={styles.loader} >
        <Loader/>
      </div>
    )
  }

  if (error) {
    return <h1>Error...</h1>
  }

  // Work For Delete Todos
  const deleteTask = (id) => {
    deleteTodo({
      variables: {
        id
      },
      refetchQueries: [{ query: GET_TODOS }]
    })
  }

  // Work For Update Todos
  const updateTask = () => {
    updateTodo({
      variables: {
        id: updateId,
        task: updateInput
      },
      refetchQueries: [{ query: GET_TODOS }]
    })
  }


  return (

    <div className={styles.main_div} >

      <div className={styles.add_task_div} >

        <TextField
          variant="outlined"
          color="primary"
          label="Add Todo"
          type="text"
          className={styles.input}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
          }}
        />

        <button className={styles.add_btn} onClick={addTask} >Add Todo</button><br />
      </div>


      <br />
      <div>
        {data.todos.map((todo) => {
          console.log('todo id', todo.id);

          return (
            <div className={styles.task_main_div} key={todo.id}>

              <div className={styles.todo_task_div}>
                <p className={styles.task_p} >{todo.task}</p>
              </div>

              <div className={styles.todo_icon}>
                <button className={styles.deleteTask_icon} onClick={() => deleteTask(todo.id)} ><DeleteIcon /></button>
                <button className={styles.updateTask_icon} onClick={() => {
                  handleOpen();
                  setUpdateId(todo.id);
                }} ><UpdateIcon /></button>
              </div>

              {/* Moadl */}

              <ListItemSecondaryAction>
                <Modal
                  open={open}
                  onClose={handleClose}
                  aria-labelledby="simple-modal-title"
                  aria-describedby="simple-modal-description"
                >
                  <div style={modalStyle} className={classes.paper} >
                
                    <TextField
                      variant="outlined"
                      // color="primary"
                      label="Add Todo"
                      type="text"
                      value={updateInput}
                      onChange={(e) => {
                        setUpdateInput(e.target.value);
                      }}
                    />
                    <div style={{ marginTop: '20px' }} >
                      <Button type='submit' color='secondary' onClick={updateTask} variant='outlined' >Update</Button>
                    </div>
                  </div>

                </Modal>
              </ListItemSecondaryAction>

            </div>
          )
        })}

      </div>
    </div>
  )
}
