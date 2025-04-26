import {Provider} from "./Provider.ts";

export class AuthProvider extends Provider{
    login(email : string, password : string){
        return this.axios.post('/login', {email, password})
    }

    getUser(){
        return this.axios.get('/user')
    }
}