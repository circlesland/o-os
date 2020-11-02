import { Context, defaultHost } from "@textile/context";
import { WebsocketTransport } from "@textile/grpc-transport";
import * as pb from "@textile/hub-grpc/hub_pb";
import {
    APIServiceClient,
    ServiceError,
} from "@textile/hub-grpc/hub_pb_service";
import type { ApiResponse } from "@omoearth/o-types";
import type { User } from "@omoearth/o-types";
import { Buckets, Identity, KeyInfo, ThreadID } from '@textile/hub';
import { Client as ThreadClient } from "@textile/hub-threads-client"


export class SessionService {
    private session: string = "";
    private publicKey: string;
    private privateKey: string;
    addrGatewayUrl: string;
    addrAPIUrl: string;
    context: Context;
    client: APIServiceClient;
    username: string;
    useremail: string;

    private hostsWhiteList: string[] = [
        "omo.earth:5000",
        "omo.local:5000",
        "127.0.0.1:5000",
        "localhost:5000",
        "192.168.1.52:5000"
    ];
    profileImage: string = null;
    userImage: string;

    private constructor() {
        this.addrGatewayUrl = "https://hub.textile.io";
        this.addrAPIUrl = defaultHost;
        this.context = new Context(this.addrAPIUrl);
        this.client = new APIServiceClient(this.context.host, { transport: WebsocketTransport(), });
    }

    private static _instance: SessionService | null = null;

    static async GetInstance(): Promise<SessionService> {
        if (this._instance == null) {
            this._instance = new SessionService();
            if (window.localStorage["sid"] != undefined && window.localStorage["sid"] != null && window.localStorage["sid"] != "" && window.localStorage["sid"] != "null")
                await this._instance.restoreSession(window.localStorage["sid"]);
        }
        else if (!this._instance.username) await this._instance.restoreSession(window.localStorage["sid"]);

        return this._instance;
    }

    async storeSession(sessionId) {
        // TODO  implement whitelist
        // if (this.hostsWhiteList.some(x => x == window.location.host))
        window.localStorage.setItem("sid", sessionId);
        this.session = sessionId;
    }

    async restoreSession(sessionId?: string): Promise<SessionService> {
        if (this.session) sessionId = this.session;
        else sessionId = sessionId ? sessionId : window.localStorage.getItem("sid");
        await this.updateSession(sessionId, this);
        window["session"] = this;

        return this;
    }

    async signInOrSignUp(userEmail: string, username?: string): Promise<ApiResponse> {
        let resp = await this.signIn(userEmail);
        if (resp.error && resp.error.code == 5) {
            resp = await this.signUp(userEmail, username);
        }
        return resp;
    }
    async updateSession(sessionId: string, instance?: SessionService): Promise<SessionService> {
        this.storeSession(sessionId);
        var instance = instance ? instance : await SessionService._instance;
        if (instance.session == null || instance.session == "null" || instance.session == "")
            return this;
        let meta = await instance.context.withSession(instance.session).toMetadata();
        let req = new pb.GetSessionInfoRequest();
        this.context = this.context.withSession(sessionId);
        return new Promise((resolve) => {
            instance.client.getSessionInfo(
                req,
                meta,
                async (
                    error: ServiceError | null,
                    message: pb.GetSessionInfoResponse | null
                ) => {
                    instance.username = message.getUsername();
                    instance.useremail = message.getEmail();
                    instance.privateKey = message.getKey_asB64();
                    instance.session = sessionId;
                    let cid = (await this.getProfileImageMeta())?.cid;
                    if (cid) {
                        instance.profileImage = `https://hub.textile.io/ipfs/${cid}`;
                    }
                    SessionService._instance = instance;
                    resolve(instance);
                }
            );
        });

    }

    async signUp(userEmail: string, username?: string): Promise<ApiResponse> {
        let instance = await SessionService.GetInstance();
        let meta = await instance.context.toMetadata();
        let req = new pb.SignupRequest();
        req.setEmail(userEmail);
        username = username ? username : userEmail.split("@")[0];
        req.setUsername(username);

        return new Promise((resolve) => {
            instance.client.signup(
                req,
                meta,
                async (error: ServiceError | null, message: pb.SignupResponse | null) => {
                    let resp: ApiResponse = error
                        ? { error, session: null }
                        : { error: null, session: message?.getSession() };

                    if (resp.error == null)
                        await this.updateSession(resp.session);
                    resolve(resp);
                }
            );
        });
    }

    async signIn(usernameOrEmail): Promise<ApiResponse> {
        let instance = await SessionService.GetInstance();
        let meta = await instance.context.toMetadata();
        let req = new pb.SigninRequest();
        req.setUsernameOrEmail(usernameOrEmail);
        return new Promise((resolve) => {
            instance.client.signin(
                req,
                meta,
                async (error: ServiceError | null, message: pb.SigninResponse | null) => {
                    let resp: ApiResponse = error
                        ? { error, session: null }
                        : { error: null, session: message?.getSession() };
                    if (resp.error == null)
                        await this.updateSession(resp.session);
                    resolve(resp);
                }
            );
        });
    }

    getUsername() {
        return this.username;
    }
    getUserMail() {
        return this.useremail;
    }

    getUser() {
        return {
            username: this.username,
            email: this.useremail,
            img: this.profileImage ? this.profileImage : "/images/placeholder_profile.jpg"
        }
    }

    async listKeys(): Promise<pb.ListKeysResponse> {
        this.context = this.context.withSession(this.session);
        let meta = await this.context.toMetadata();
        let req = new pb.ListKeysRequest();

        this.client.getIdentity
        return new Promise((resolve) => {
            this.client.listKeys(req, meta, (error: ServiceError | null,
                message: pb.ListKeysResponse | null
            ) => {
                resolve(message)
            });
        });
    }

    private async getIdentity() {
        let req = new pb.GetIdentityRequest();
        let meta = await this.context.toMetadata();
        return new Promise((resolve) => {
            this.client.getIdentity(req, meta, (error: ServiceError | null,
                message: pb.GetIdentityResponse | null
            ) => {
                if (message) {
                    resolve(message.getIdentity());
                }
                console.error(error);
                resolve(undefined);
            });
        });
    }

    private async orgs(): Promise<pb.OrgInfo[]> {
        let req = new pb.ListOrgsRequest();
        let meta = await this.context.toMetadata();
        return new Promise((resolve) => {
            this.client.listOrgs(req, meta, (error: ServiceError | null,
                message: pb.ListOrgsResponse | null
            ) => {
                if (message) {
                    resolve(message.getListList());
                }
                // console.error(error);
                resolve(undefined);
            });
        });
    }

    private odentityThread: string = null;
    private async getOrCreateThread(name: string) {
        if (this.odentityThread) return this.odentityThread;
        let context = this.context.withSession(this.session);
        let client = new ThreadClient(this.context);
        let threads = await client.listThreads(context);
        let thread = threads.listList.find(t => t.name == name);
        if (thread) return thread.id;
        var threadID = await client.newDB(ThreadID.fromRandom(), name);
        return threadID;
    }

    private async getOdentityBucket() {
        var buckets = new Buckets(this.context);
        return await buckets.getOrCreate("ODENTITYee", "ODENTITYee", false);
    }

    async getProfileImageMeta() {
        try {
            var buckets = new Buckets(this.context);
            var bucket = await this.getOdentityBucket();
            let meta = await buckets.pullPath(bucket.root.key, "/profileImage.json", {})

            const { value } = await meta.next();
            let str = "";
            for (var i = 0; i < value.length; i++) {
                str += String.fromCharCode(parseInt(value[i]));
            }
            return JSON.parse(str);
        }
        catch (e) { }
        return null;
    }

    async saveProfileImage(file: File, meta: any) {
        var buckets = new Buckets(this.context);
        var bucket = await this.getOdentityBucket();
        let raw = await buckets.pushPath(bucket.root.key, "/profileImage", file.stream());
        meta.cid = raw.path.cid.toString();
        this.profileImage = `https://ipfs.io/ipfs/${meta.cid}`;

        await buckets.pushPath(bucket.root.key, "/profileImage.json", JSON.stringify(meta));
    }

    //     type Odentity[
    //     username: string,
    //     email: string,
    //     familyName; string,
    //     givenName: string,
    // ]

    // console.log("ORGS",await this.orgs());
    // let orgs = await this.orgs();
    // // orgs[0].
    // var bucks = [];
    // this.context = this.context.withSession(this.session);
    // var threadClient = new ThreadClient(this.context);
    // window["t1"] = threadClient;
    // window["c1"] = this.context.toJSON();

    // const db = new ThreadClient(this.context);

    // const id = ThreadID.fromRandom()
    // await db.newDB(id, 'my-buckets')
    // window["t1"] = debug;
    // window["c2"] = this.context.toJSON();


    // for (let org of orgs) {
    //     // debugger;
    //     this.context.set("x-textile-org", org.getName());
    //     this.context.set("x-textile-thread", null);

    //     try {


    //         threadClient = new ThreadClient(this.context);

    //         let threads = await threadClient.listThreads();
    //         for (let thread of threads.listList.filter(x => x.isDb)) {
    //             try {

    //                 this.context.set("x-textile-thread", thread.id);
    //                 if (thread.name)
    //                     this.context.set("x-textile-thread-name", thread.name);

    //                 var buckets = new Buckets(this.context);
    //                 bucks.push(...(await buckets.list()));
    //             }
    //             catch (e) {
    //                 console.log(JSON.stringify(thread));
    //                 console.log(e);
    //             }
    //         }
    //     } catch (e) {
    //         console.log(e);
    //     }
    // }



    // return bucks;

    // async getOrCreateKey(): Promise<KeyInfo | undefined> {
    //     var response = await this.listKeys();


    //     for (let item of response.getListList()) {
    //         if (item.getValid() && item.getType() == pb.KeyType.KEY_TYPE_ACCOUNT)
    //             return { key: item.getKey(), secret: item.getSecret() };
    //     }

    //     let meta = await this.context.toMetadata();
    //     let req = new pb.CreateKeyRequest();
    //     req.setType(pb.KeyType.KEY_TYPE_ACCOUNT);
    //     return new Promise((resolve) => {
    //         this.client.createKey(req, meta, (error: ServiceError | null,
    //             message: pb.CreateKeyResponse | null
    //         ) => {
    //             if (message) {
    //                 let key = message.getKeyInfo()
    //                 resolve({ key: key.getKey(), secret: key.getSecret() })
    //                 console.error(error);
    //                 resolve(undefined);
    //             }
    //         });
    //     });
    // }

    async listBuckets(key, secret) {
        const buckets = await Buckets.withKeyInfo({ key, secret });
        let buck = await buckets.getOrCreate("mein bucket");

        let start = new Date();
        for (let i = 0; i < 100; i++) {
            const path = `index${i}.json`
            const buf = Buffer.from(JSON.stringify("testcontent" + i, null, 2))
            var foo = await buckets.pushPath(buck.root.key, path, buf);
        }

        let end = new Date();
        console.log("hub push take (average 100) " + (end.getMilliseconds() - start.getMilliseconds()) / 100 + " milliseconds")
        console.log("uploaded mudda", foo);

        // console.log(await buckets.listPathFlat(buck.root.key, "/"));
        // let bucks = await buckets.list();
        // console.log(bucks);
        // for (let buck of bucks) {

        //     console.log(await buckets.listPathFlat(buck.key, "/"));
        // }
        // buckets.
        return null;
    }

    get hasSession() {
        return this.session != "";
    }

    async logout() {
        this.context = this.context.withSession(this.session);
        let meta = await this.context.toMetadata();
        let req = new pb.SignoutRequest();
        return new Promise((resolve) => {
            this.client.signout(req, meta, async (error: ServiceError | null,
                message: pb.SignoutResponse | null
            ) => {
                localStorage.removeItem("sid");
                SessionService._instance = null;
                window.o.session = await SessionService.GetInstance();
                resolve(message)
            });
        });
    }
}
