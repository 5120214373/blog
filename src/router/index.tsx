import Content from "../views/Content"
import Home from "../views/Home"
import {Navigate} from 'react-router-dom'
const router= [
    {
        path:'home',
        element:<Home/>
    },
    {
        path:'/:id',
        element:<Content/>
    },
    {
        path:'/',
        element:<Navigate to="/home"/>
    },
]
export default router