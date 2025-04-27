import {Provider} from "../providers/Provider.ts";
import {Axios} from "axios";
import {axiosInstance} from "../providers/axiosInstance.ts";
import {useState} from "react";

/**
 * A custom hook that simplifies the interaction with a provider class,
 * allowing execution of methods and managing its loading and result states.
 */
export function useProvider<T extends Provider>(provider: new (axios: Axios) => T
    , method : keyof T, defaultValue : any, defaultValueLoading : boolean = false){

    const [result, setResult] = useState(defaultValue)
    const [loading, setLoading] = useState<boolean>(defaultValueLoading)

    async function fetch(...args : any[]){
        setLoading(true)
        let response;
        try{
            //@ts-ignore
            response = await providerInstance[method].call(providerInstance, ...args)
            setResult(response.data)
        }catch (e) {
            setResult(defaultValue)
        }finally {
            setLoading(false)
        }
        return response;

    }

    const providerInstance = new provider(axiosInstance)
    return [result, fetch, loading]
}
