import 'whatwg-fetch'
import history from '../history'

export function createCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}

export function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)===' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length,c.length)
    }
    return null;
}

export function eraseCookie(name) {
    createCookie(name,"",-1);
}

const apiPost = (url, data) => {
    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
}

export const apiAuth = (password) => {
    return function(dispatch, getState) {
        const url = `/api/get-session/`
        const authData = {
            login: 'admin',
            password: password,
        }
        apiPost(url, authData).then(function(response) {
            if (!response.ok) {
                throw Error(response.statusText);
            }
            return response;
        }).then(function(response) {
            return response.json()
        }).catch(function(error) {
            console.log(error);
        }).then(function(json) {
            if (json.token !== undefined) {
                createCookie('token',json.token,7);
                history.push('/admin')
            } else {
                eraseCookie('token')
            }
        })
    } 
}