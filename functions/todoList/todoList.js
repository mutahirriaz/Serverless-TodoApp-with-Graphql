const { ApolloServer, gql } = require('apollo-server-lambda')
var faunadb = require('faunadb');
q = faunadb.query
var dotenv = require('dotenv');
dotenv.config()


const typeDefs = gql`
  type Query {
    todos: [Todo!]
  }
  type Mutation {
    addTodo(task: String!):Todo
    deleteTodo(id: ID!):Todo
    updateTodo(id:ID!, task:String!):Todo
  }
  type Todo {
    id: ID!
    task: String!
    status: Boolean!
  }
`

const resolvers = {
  // Query
  Query: {
    todos: async (root, args, context) => {
      try {
        // access faunadb
        const client = new faunadb.Client({ secret: process.env.REACT_APP_FAUNADB_KEY });

        const result = await client.query(
          q.Map(
            q.Paginate(
              q.Documents(q.Collection('posts'))
            ),
            q.Lambda(x => q.Get(x))
          )
        )
        console.log(result.data);
        return result.data.map((item)=>{
          return{
            task: item.data.task,
            id: item.ref.id,
            status: item.data.status
          }
        })

      }
      catch (error) {
        console.log(error)
      }
    }
  },

  // Mutation
  Mutation: {
    addTodo: async(_, {task})=> {
      try{
        const client = new faunadb.Client({ secret: 'fnAD_yKCoFACBcexXurjHP-imbDC51JBpa2Xofmf' });

        const result = await client.query(
          q.Create(
            q.Collection('posts'),
            {data: {
              
              task: task,
              status: true
            }},
          )
        )
        return result.ref.data;
      }
      catch(error){
        console.log(error)
      }
    },
    deleteTodo: async(_, {id})=> {
      try{
        const client = new faunadb.Client({secret: 'fnAD_yKCoFACBcexXurjHP-imbDC51JBpa2Xofmf'})

        const result = await client.query(
          q.Delete(q.Ref(q.Collection('posts'), id))
        )

        console.log('id', id)
        console.log(result)
        
      }
      catch(error){
        console.log(error)
      }
    },
    updateTodo: async(_, {id, task})=> {
      try{
        const client = new faunadb.Client({secret: 'fnAD_yKCoFACBcexXurjHP-imbDC51JBpa2Xofmf'})

        const result = await client.query(
          q.Update(
            q.Ref(q.Collection('posts'),id),
            {
              data: {
                task
              }
            }
          )
        )
        console.log('update id', id)
        return result
      }
      catch(error){
        console.log(error)
      }
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

exports.handler = server.createHandler()
