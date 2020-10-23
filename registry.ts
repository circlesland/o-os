import type { Constructor, oRegistry } from "o-types";

export class Registry implements oRegistry {
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


