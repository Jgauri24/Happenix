
import {create} from "zustand";
import api from '../utils/api';
import { loadAuthState, saveAuthState, clearAuthState } from '../utils/storage';


// loading intial state and setting auth header if token exists
const initialState = loadAuthState();
if(initialState.token){
    api.defaults.headers.common["Authorization"]=`Bearer ${initialState.token}`;

}
// handle auth success
const handleAuthSucc=(set,user,token)=>{
    const newState={user ,token,loading:false}
    set(newState)
    api.defaults.headers.common["Authorization"]=`Bearer ${token}`;
    saveAuthState({user,token})
    return {success:true,user,token}
}
// handle auth error

const handleAuthErr=(set,error)=>{
    set({loading:false});
    return {
        success:false , message: error.response?.data?.message || 'Authentication failed'
    };
}

export const useAuthStore=create((set,get)=>({
    user:initialState.user,
    token:initialState.token,
    loading:false,
    login:async (email,password)=>{
        set({loading:true});
        try{
const response=await api.post("/auth/login",{email,password})
return handleAuthSucc(set, response.data.user, response.data.token)
        }catch(err){
            return handleAuthErr(set, err);
        }
    }
    ,
    register:async(name,email,password)=>{
     set({ loading: true });
     try{
        const response=await api.post("/auth/register",{name,email,password})
        return handleAuthSucc(set,response.data.user,response.data.token)
     }
     catch (error) {
        return handleAuthErr(set, error);
      }
    }
,
logout:()=>{
    set({user:null,token:null})
    delete api.defaults.headers.common['Authorization'];
clearAuthState()
},
updateUser:(userData)=>{
const currState=get();
const newUser={...currState.user,...userData}
set({user:newUser})
saveAuthState({user:newUser,token:currState.token})
}
,
loadUser:async()=>{
    try
   { const token=get().token
    if(!token) return 
    const response=await api.get("/auth/me");
    const currState=get()
    const newUser=response.data.user
    set({user:newUser})
    saveAuthState({user:newUser,token:currState.token})}
    catch(err){
        get().logout(); 
    }
}
}))