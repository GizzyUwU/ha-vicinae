import axios, { type AxiosInstance } from "axios";
import type * as HATypes from "./ha.d";

export default class HA {
  lastCode: number | null = null;
  private apiToken: string;
  private fetch: AxiosInstance;
  private ready: Promise<void>;

  constructor(server: string, apiToken: string) {
    if (server.length === 0)
      throw new Error("Home Assistant server url is required");
    if (apiToken.length === 0)
      throw new Error("Home Assistant API key is required");
    console.log(server);
    this.apiToken = apiToken;
    this.fetch = axios.create({
      baseURL: new URL("/api", server).toString(),
      proxy: false,
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
      },
    });
    this.ready = Promise.resolve();
  }

  private async handleError(err: unknown, log: boolean = true): Promise<void> {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status ?? "No status";
      const message = err.response?.data?.message ?? err.message;
      if (log) {
        console.error(`[${status}]: ${message}`);
      }

      this.lastCode = err?.response?.status ?? err?.status ?? null;

      return;
    } else {
      if (log) {
        console.error("Unexpected error:", err);
      }
      return;
    }
  }

  async getStates(
    id?: string,
  ): Promise<HATypes.GetStatesEndpoint | HATypes.GetStatesEntityEndpoint> {
    await this.ready;
    return this.fetch
      .get(id ? `/states/${id}` : "/states")
      .then((res) => {
        this.lastCode = res.status;
        return res.data;
      })
      .catch((err) => {
        this.handleError(err);
      });
  }

  async toggleItem(
    domain: string,
    id: string,
  ): Promise<HATypes.PostServicesDomainServiceEndpoint> {
    await this.ready;
    return this.fetch
      .post(`/services/${domain}/toggle`, {
        "entity_id": id
      })
      .then((res) => {
        this.lastCode = res.status;
        return res.data;
      })
      .catch((err) => {
        this.handleError(err);
      });
  }

  async postTemplate(
    body: HATypes.PostTemplateBody,
  ): Promise<HATypes.PostTemplateEndpoint> {
    await this.ready;
    console.log(body);
    return this.fetch
      .post("/template", body)
      .then((res) => {
        this.lastCode = res.status;
        return res.data;
      })
      .catch((err) => {
        console.log(err);
        this.handleError(err);
      });
  }

  // async project(param: FTypes.ProjectParam): Promise<FTypes.Project | void> {
  //     await this.ready;
  //     return this.fetch.get("/projects/" + param.id)
  //         .then((res) => {
  //             this.lastCode = res.status;
  //             return res.data;
  //         })
  //         .catch((err) => {
  //             this.handleError(err, String(param.id));
  //         });
  // }

  // async devlogs(param: FTypes.ProjectParam, query?: FTypes.DevlogsQuery): Promise<FTypes.Devlogs | void> {
  //     await this.ready;
  //     const queryString = new URLSearchParams();
  //     if (query) {
  //         Object.entries(query).forEach(([key, value]) => {
  //             if (value !== undefined) {
  //                 queryString.append(key, String(value));
  //             }
  //         });
  //     }

  //     return this.fetch.get("/projects/" + param.id + "/devlogs" + queryString)
  //         .then((res) => {
  //             this.lastCode = res.status;
  //             return res.data;
  //         })
  //         .catch((err) => {
  //             this.handleError(err, String(param.id));
  //             return err;
  //         });
  // }

  // async devlog(param: FTypes.DevlogParam, query?: FTypes.DevlogsQuery): Promise<FTypes.Devlog | void> {
  //     await this.ready;
  //     return this.fetch.get("/projects/" + param.projectId + "/devlogs/" + param.devlogId)
  //         .then((res) => {
  //             this.lastCode = res.status;
  //             return res.data;
  //         })
  //         .catch((err) => {
  //             this.handleError(err, String(param.projectId));
  //         });
  // }

  // async users(query: FTypes.UsersQuery): Promise<FTypes.Users | void> {
  //     await this.ready;
  //     const queryString = new URLSearchParams();
  //     if (query) {
  //         Object.entries(query).forEach(([key, value]) => {
  //             if (value !== undefined) {
  //                 queryString.append(key, String(value));
  //             }
  //         });
  //     }
  //     return this.fetch.get("/users/" + queryString)
  //         .then((res) => {
  //             this.lastCode = res.status;
  //             return res.data;
  //         })
  //         .catch((err) => {
  //             this.handleError(err, String(queryString));
  //         });
  // }

  // async user(param: FTypes.UserParams): Promise<FTypes.User | void> {
  //     await this.ready;
  //     return this.fetch.get("/users/" + param.id)
  //         .then((res) => {
  //             this.lastCode = res.status;
  //             return res.data;
  //         })
  //         .catch(async (err) => {
  //             await this.handleError(err, String(param.id), false);
  //             return {} as FTypes.User;
  //         });
  // }
}
