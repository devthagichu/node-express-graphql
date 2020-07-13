import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import {
    GraphQLObjectType,
    GraphQLNonNull,
    GraphQLInt,
    GraphQLBoolean,
    GraphQLString,
    GraphQLList,
    GraphQLSchema,
} from 'graphql'
import Axios from 'axios'
const graphqlHTTP = require('express-graphql').graphqlHTTP


const postUrl = "https://jsonplaceholder.typicode.com/posts/"
const userUrl = "https://jsonplaceholder.typicode.com/users/"
const commentsUrl = "https://jsonplaceholder.typicode.com/comments/"

const getPosts = async () => {
    const fetchedPosts = await Axios(postUrl)
    const { data } = fetchedPosts
    return data
}
const getUsers = async () => {
    const fetchedUsers = await Axios(userUrl)
    const { data } = fetchedUsers
    return data
}

const getComments = async () => {
    const fetchedComments = await Axios(commentsUrl)
    const { data } = fetchedComments
    return data
}

const getCommentsByPostId = async (postId) => {
    const fetchedComments = await Axios(`${commentsUrl}/?postId=${postId}`)
    const { data } = fetchedComments
    return data
}

const getUsersById = async (userId) => {
    const fetchedUser = await Axios(`${userUrl}/${userId}`)
    const { data } = fetchedUser
    return data
}
const getPostById = async (postId) => {
    const fetchedPost = await Axios(`${postUrl}/${postId}`)
    const { data } = fetchedPost
    return data
}



const UserType = new GraphQLObjectType({
    name: "user",
    description: "List of Users",
    fields: () => ({

        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        username: { type: GraphQLNonNull(GraphQLString) },
        email: { type: GraphQLNonNull(GraphQLString) },
        phone: { type: GraphQLNonNull(GraphQLString) },
        website: { type: GraphQLNonNull(GraphQLString) },
    })
})

const CommentType = new GraphQLObjectType({
    name: "comments",
    description: "List of comments",
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        postId: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        email: { type: GraphQLNonNull(GraphQLString) },
        body: { type: GraphQLNonNull(GraphQLString) },
    })
})




const PostType = new GraphQLObjectType({
    name: "posts",
    description: "List of Posts",
    fields: () => ({
        userId: { type: GraphQLNonNull(GraphQLInt) },
        id: { type: GraphQLNonNull(GraphQLInt) },
        title: { type: GraphQLNonNull(GraphQLString) },
        body: { type: GraphQLNonNull(GraphQLString) },
        user: {
            type: UserType,
            resolve: (post) => { return getUsersById(post.userId) }
        },
        comments: {
            type: new GraphQLList(CommentType),
            resolve: (post) => { return getCommentsByPostId(post.id) }
        }
    })
})

const RootQueryType = new GraphQLObjectType({
    name: "Query",
    description: "Root Query",
    fields: () => ({
        post: {
            type: PostType,
            description: "Single Post",
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (posts, args) => getPostById(args.id)
        },
        posts: {
            type: new GraphQLList(PostType),
            description: "List of Posts",
            resolve: () => getPosts()
        },
        user: {
            type: UserType,
            description: "single user",
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (users, args) => getUsersById(args.id)
        }
        ,
        users: {
            type: new GraphQLList(UserType),
            description: "List of  Users",
            resolve: () => getUsers()
        },
        comments: {
            type: new GraphQLList(CommentType),
            description: "List of  Users",
            resolve: () => getComments()
        }
    })
})


// GraphQL schema
const schema = new GraphQLSchema({
    query: RootQueryType
})

// Create an express server and a GraphQL endpoint
const app = express()


app.use(bodyParser.json())

app.use(cors())
const corsOptions = {
    origin(origin, callback) {
        callback(null, true)
    },
    credentials: true
}
app.use(cors(corsOptions))
var allowCrossDomain = function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS")
    res.header("Access-Control-Allow-Headers", "Content-Type")
    next()
}

app.use(allowCrossDomain)



app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true
}))

app.listen(4000,
    () => console.log('Express GraphQL Server Now Running On localhost:4000/graphql'))