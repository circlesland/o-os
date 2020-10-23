import type { Constructor, oRegistry } from "o-types";
import { Views, Arguments, Definitions, Layouts, Leafs } from "o-views";

export class Registry implements oRegistry {
    constructor() {
        Views.forEach(v => this.registerClass(v));
        Arguments.forEach(a => this.registerClass(a));
        Definitions.forEach(d => this.registerClass(d));
        Layouts.forEach(l => this.registerClass(l));
        Leafs.forEach(l => this.registerClass(l));
    }

    private LOOKUP: { name: string, ctor: Constructor<any>, classes: string[] }[] = [];

    private getClasses(ctor: Constructor<any>, arr: string[]): string[] {
        if (!ctor) return arr; 1
        if (ctor.name == "") return;
        arr.push(ctor.name);
        this.getClasses(Object.getPrototypeOf(ctor), arr);
        return arr;
    }

    registerClass<T extends Constructor<I>, I>(ctor: T) {
        this.LOOKUP.push({ name: ctor.name, ctor, classes: this.getClasses(ctor, []) })
    }

    getClass<I>(name: string): Constructor<I> {
        return this.LOOKUP.find(x => x.name == name).ctor;
    }

    getNewInstance<I>(name: string, clone?: any, ...args: any[]): I {
        var clazz = this.getClass<I>(name)
        var instance = new clazz(...args);
        if (clone) {
            let keys = Object.keys(clone);
            for (let key of keys)
                instance[key] = clone[key];
        }
        return instance;
    }
}


