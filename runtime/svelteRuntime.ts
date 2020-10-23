import type { Observable } from "rxjs";
import { NewRuntimeInstance } from "./newRuntimeInstance";
import { RemovedRuntimeInstance } from "./removedRuntimeInstance";
import { Trigger, Manifest, ManifestDefinition, DeviceClass, oRuntime, Composite, Component } from "o-types";
import type { EventBroker } from "../_other/eventBroker";
import type { SvelteViewLeaf } from "o-views/_other/foo";


declare global {
    interface Window {
        eventBroker: EventBroker;
        // omoEvents: Topic<Event>;
        trigger: (trigger: any) => void;
        // web3: Web3;
        // o: Kernel;
    }
}

export class SvelteRuntime implements oRuntime {
   

    private _instances: {};
    private _topics: {};


    getViewByName(name: string): SvelteViewLeaf {
        throw new Error("Method not implemented.");
    }
    
    getLayoutByName(name: string): new () => Composite<any, any> {
        throw new Error("Method not implemented.");
    }

    
  

    // getLayoutByName(name: string) {
    //     let layout = Layouts.find(x => x.name == name);
    //     if (layout) return layout;
    //     // return DefaultLayout;
    //     return {};
    // }

    register(id: string, instance: any): Observable<Trigger> {
        this._instances[id] = instance;
        this._topics[id] = window.eventBroker.createTopic("omo", id);

        window.trigger(new NewRuntimeInstance(id, instance));

        return this._topics[id].observable;
    };

    find(id: string): any {
        return this._instances[id];
    };

    remove(id: string) {
        delete this._instances[id];
        window.eventBroker.removeTopic("omo", id);
        window.trigger(new RemovedRuntimeInstance(id));
    };

    getDeviceClass(): DeviceClass {
        if (window.innerWidth <= 600) return DeviceClass.mobile;
        else if (window.innerWidth <= 1024) return DeviceClass.tablet;
        else return DeviceClass.desktop;
    };

    _clone<runtime>(obj: runtime): runtime {
        const json = JSON.stringify(obj);
        const clone = JSON.parse(json);
        return clone;
    };
    
    findManifestDefinition(manifest: Manifest): ManifestDefinition {
        function collectProperties(obj: Manifest | ManifestDefinition) {
            const skip = {
                [DeviceClass.mobile]: true,
                [DeviceClass.tablet]: true,
                [DeviceClass.desktop]: true,
            };

            const properties = {};
            Object.keys(obj)
                .filter((o) => !skip[o])
                .map((o) => {
                    return { key: o, value: obj[o] };
                })
                .forEach((o) => (properties[o.key] = o.value));

            return properties;
        }

        const self = this;

        function findDeviceSpecificDefinition() {
            const deviceClass = self.getDeviceClass();

            // Find a matching definition (searching from large to small)
            const sizeMap = [
                DeviceClass.mobile,
                DeviceClass.tablet,
                DeviceClass.desktop,
            ];
            let testSize = sizeMap.indexOf(deviceClass);

            for (let i = testSize; i >= 0; i--) {
                const definition = manifest[sizeMap[i]];
                if (definition) {
                    return self._clone(definition);
                }
            }

            return null;
        }

        const deviceDefinition = findDeviceSpecificDefinition();
        const deviceProperties = deviceDefinition
            ? collectProperties(deviceDefinition)
            : {};
        const componentProperties = collectProperties(manifest);

        // Override all common properties with the device-specific value (if any)
        Object.keys(deviceProperties).forEach(
            (o) => (componentProperties[o] = deviceProperties[o])
        );

        return <any>componentProperties;
    }
}
