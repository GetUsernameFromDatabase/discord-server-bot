import { ObjectMethod } from '@babel/types';

export interface EventObject {
  name: String;
  once?: Boolean;
  execute: ObjectMethod;
}
