import type {Axios} from "axios";

export abstract class Provider {
    public constructor(protected axios : Axios){}
}