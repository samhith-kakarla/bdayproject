import { Dispatch } from 'redux'; 
import { rootActions } from '../types/rootActionTypes'; 
import { User } from '../types/models'; 
import axios from 'axios'; 

// TYPES
import {
    SIGNUP_SUCCESS, 
    SIGNUP_FAIL, 
    LOGIN_FAIL, 
    LOGIN_SUCCESS, 
    ACTIVATION_SUCCESS, 
    ACTIVATION_FAIL, 
    RESET_PASSWORD_SUCCESS, 
    RESET_PASSWORD_FAIL, 
    RESET_PASSWORD_CONFIRM_SUCCESS, 
    RESET_PASSWORD_CONFIRM_FAIL, 
    USER_LOADED_SUCCESS, 
    USER_LOADED_FAIL, 
    AUTHENTICATED_SUCCESS,
    AUTHENTICATED_FAIL, 
    LOGOUT, 
    GOOGLE_AUTH_SUCCESS, 
    GOOGLE_AUTH_FAIL,
    FACEBOOK_AUTH_SUCCESS, 
    FACEBOOK_AUTH_FAIL
} from '../types/authActionTypes'; 


// ACTIONS
export const checkAuthenticated = () => async (dispatch: Dispatch<rootActions>) => {
    if (typeof window == "undefined") {
        dispatch({
            type: AUTHENTICATED_FAIL, 
            user: null, 
            access: '', 
            refresh: '', 
            isAuthenticated: true, 
        }); 
    }
    
    if (localStorage.getItem("access")) {
        const config = {
            headers: {
                'Accept': 'application/json', 
                'Content-type': 'application/json', 
            }
        }

        const body = JSON.stringify({ token: localStorage.getItem("access") }); 

        try {
            const res = await axios.post('http://127.0.0.1:8000/api/auth/jwt/verify/', body, config); 
            if (res.data.code !== 'token_not_valid') {
                dispatch({
                    type: AUTHENTICATED_SUCCESS, 
                    user: null, 
                    access: '', 
                    refresh: '', 
                    isAuthenticated: true, 
                }); 
            } else {
                dispatch({
                    type: AUTHENTICATED_FAIL, 
                    user: null, 
                    access: '', 
                    refresh: '', 
                    isAuthenticated: true, 
                }); 
            }
        } catch (error) {
            console.log(error); 
            dispatch({
                type: AUTHENTICATED_FAIL, 
                user: null, 
                access: '', 
                refresh: '', 
                isAuthenticated: true, 
            }); 
        }
    } else {
        dispatch({
            type: AUTHENTICATED_FAIL, 
            user: null, 
            access: '', 
            refresh: '', 
            isAuthenticated: true, 
        }); 
    }
}


export const loadUser = () => async (dispatch: Dispatch<rootActions>) => {
    if (localStorage.getItem("access")) {
        const config = {
            headers: {
                'Accept': 'application/json', 
                'Authorization': `JWT ${localStorage.getItem("access")}`, 
                'Content-type': 'application/json', 
            }
        }; 

        try {
            const res = await axios.get('http://127.0.0.1:8000/api/auth/users/me/', config); 
            
            dispatch({
                type: USER_LOADED_SUCCESS, 
                user: res.data, 
                access: '', 
                refresh: '', 
                isAuthenticated: null,
            }); 
        } catch (error) {
            console.log(error); 
            dispatch({
                type: USER_LOADED_FAIL, 
                user: null, 
                access: '', 
                refresh: '', 
                isAuthenticated: null, 
            }); 
        }
    } else {
        dispatch({
            type: USER_LOADED_FAIL, 
            user: null, 
            access: '', 
            refresh: '', 
            isAuthenticated: null, 
        }); 
    }
}


export const googleAuthenticate = (state: string, code: string) => async (dispatch: Dispatch<rootActions>) => {
    if (state && code && !localStorage.getItem("access")) {
        const config = {
            headers: {
                'Content-type': 'application/x-www-form-urlencoded', 
            }
        }; 

        const details = {
            'state': state, 
            'code': code,
        }; 

        const formBody = Object.keys(details).map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(details[key])).join('&');

        try {
            const res = await axios.post(`http://127.0.0.1:8000/api/auth/o/google-oauth2/?${formBody}`, config); 

            dispatch({
                type: GOOGLE_AUTH_SUCCESS, 
                user: null, 
                access: res.data.access,  
                refresh: res.data.refresh, 
                isAuthenticated: true, 
            }); 

            loadUser(); 
        } catch (error) {
            console.log(error); 
            
            dispatch({
                type: GOOGLE_AUTH_FAIL, 
                user: null, 
                access: '', 
                refresh: '', 
                isAuthenticated: false,
            });
        }
    }
}


export const facebookAuthenticate = (state: string, code: string) => async (dispatch: Dispatch<rootActions>) => {
    if (state && code && !localStorage.getItem("access")) {
        const config = {
            headers: {
                'Content-type': 'application/x-www-form-urlencoded', 
            }
        }; 

        const details = {
            'state': state, 
            'code': code,
        }; 

        const formBody = Object.keys(details).map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(details[key])).join('&');

        try {
            const res = await axios.post(`http://127.0.0.1:8000/api/auth/o/facebook/?${formBody}`, config); 

            dispatch({
                type: FACEBOOK_AUTH_SUCCESS, 
                user: null, 
                access: res.data.access,  
                refresh: res.data.refresh, 
                isAuthenticated: true, 
            }); 

            loadUser(); 
        } catch (error) {
            console.log(error); 
            
            dispatch({
                type: FACEBOOK_AUTH_FAIL, 
                user: null, 
                access: '', 
                refresh: '', 
                isAuthenticated: false,
            });
        }
    }
}


export const login = (email: string, password: string) => async (dispatch: Dispatch<rootActions>) => {
    const config = {
        headers: {
            'Content-type': 'application/json', 
        }
    }; 

    const body = JSON.stringify({ email, password }); 

    try {
        const res = await axios.post('http://127.0.0.1:8000/api/auth/jwt/create/', body, config); 

        dispatch({
            type: LOGIN_SUCCESS, 
            user: null, 
            access: res.data.access,  
            refresh: res.data.refresh, 
            isAuthenticated: true, 
        }); 

        loadUser(); 
    } catch (error) {
        console.log(error); 

        dispatch({
            type: LOGIN_FAIL, 
            user: null, 
            access: null,  
            refresh: null, 
            isAuthenticated: false, 
        }); 
    }
}


export const signup = (
    firstName: string, lastName: string, email: string, password: string, re_password: string
) => async (dispatch: Dispatch<rootActions>) => {
    const config = {
        headers: {
            'Content-type': 'application/json', 
        }
    }; 

    const body = JSON.stringify({ firstName, lastName, email, password, re_password }); 

    try {
        await axios.post('http://127.0.0.1:8000/api/auth/users/', body, config); 

        dispatch({
            type: SIGNUP_SUCCESS, 
            user: null, 
            access: '', 
            refresh: '', 
            isAuthenticated: false, 
        }); 
    } catch (error) {
        dispatch({
            type: SIGNUP_FAIL, 
            user: null, 
            access: '', 
            refresh: '', 
            isAuthenticated: false, 
        }); 
    }
}


export const logout = () => async (dispatch: Dispatch<rootActions>) => {
    dispatch({
        type: LOGOUT, 
        user: null, 
        access: '', 
        refresh: '', 
        isAuthenticated: false
    });
}


export const verify = (uid: string, token: string) => async (dispatch: Dispatch<rootActions>) => {
    const config = {
        headers: {
            'Content-type': 'application/json', 
        }
    }; 

    const body = JSON.stringify({ uid, token }); 

    try {
        await axios.post('http://127.0.0.1:8000/api/auth/users/activation/', body, config); 

        dispatch({
            type: ACTIVATION_SUCCESS, 
            user: null, 
            access: '', 
            refresh: '', 
            isAuthenticated: false, 
        });
    } catch (error) {
        dispatch({
            type: ACTIVATION_FAIL, 
            user: null, 
            access: '', 
            refresh: '', 
            isAuthenticated: false, 
        });
    }
}


export const resetPassword = (email: string) => async (dispatch: Dispatch<rootActions>) => {
    const config = {
        headers: {
            'Content-type': 'application/json', 
        }
    }; 

    const body = JSON.stringify({ email }); 

    try {
        await axios.post('http://127.0.0.1:8000/api/auth/users/reset_password/', body, config); 
        
        dispatch({
            type: RESET_PASSWORD_SUCCESS, 
            user: null, 
            access: '', 
            refresh: '', 
            isAuthenticated: false,
        }); 
    } catch (error) {
        console.log(error); 

        dispatch({
            type: RESET_PASSWORD_FAIL, 
            user: null, 
            access: '', 
            refresh: '', 
            isAuthenticated: false,
        }); 
    }
}


export const resetPasswordConfirm = (
    uid: string, token: string, new_password: string, re_new_password: string
) => async (dispatch: Dispatch<rootActions>) => {
    const config = {
        headers: {
            'Content-type': 'application/json', 
        }
    }; 

    const body = JSON.stringify({ uid, token, new_password, re_new_password }); 

    try {
        await axios.post('http://127.0.0.1:8000/api/auth/users/reset_password_confirm/', body, config); 
        
        dispatch({
            type: RESET_PASSWORD_CONFIRM_SUCCESS, 
            user: null, 
            access: '', 
            refresh: '', 
            isAuthenticated: false,
        }); 
    } catch (error) {
        console.log(error); 

        dispatch({
            type: RESET_PASSWORD_CONFIRM_FAIL, 
            user: null, 
            access: '', 
            refresh: '', 
            isAuthenticated: false,
        }); 
    }
}