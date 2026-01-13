export type GetApiEndpoint = {
    message: string;
}

export type GetConfigEndpoint = {
    components: string[];
    config_dir: string;
    elevation: number;
    latitude: number;
    location_name: string;
    longitude: number;
    time_zone: string;
    unit_system: {
        length: string;
        mass: string;
        temperature: string;
        volume: string;
    }
    version: string;
    whitelist_external_dirs: string[];
}

export type GetComponentsEndpoint = string[];
export type GetEventsEndpoint = {
    event: string;
    listener_count: number;
}[];

export type GetServicesEndpoint = {
    domain: string;
    services: string[];
}[];

export type GetHistoryPeriodTSQuery = {
    end_time?: string;
    filter_entity_id: string;
    minimal_response?: "";
    no_attributes?: "";
    significant_changes_only?: "";
}

export type GetHistoryPeriodTSEndpoint = {
    attributes?: Record<string, any>;
    entity_id?: string;
    last_changed?: string;
    last_updated?: string;
    state: string;
}[][];

export type GetLogbookTSQuery = {
    end_time?: string;
    entity?: string;
}
export type GetLogbookTSEndpoint = {
    context_user_id: string | null;
    domain: string;
    entity_id: string;
    message: string;
    name: string;
    when: string;
}[]

export type GetStatesEndpoint = {
    attributes: Record<string, any>;
    entity_id: string;
    last_changed: string;
    state: string;
}[];

export type GetStatesEntityEndpoint = {
    attributes: Record<string, any>;
    entity_id: string;
    last_changed: string;
    last_updated: string;
    state: string;
}

export type GetErrorLogEndpoint = string;

export type GetCalendarsEndpoint = {
    entity_id: string;
    name: string;
}[]

export type GetCalendarsEntityQuery = {
    start?: string;
    end?: string;
}
export type GetCalendarsEntityEndpoint = {
    summary: string;
    start: {
        date?: string;
        dateTime?: string;
    };
    end: {
        date?: string;
        dateTime?: string;
    }
    description: string;
    location: string;
}

export type PostStatesEntityBody = {
    state: string;
    attributes: Record<string, any>;
}

export type PostStatesEntityEndpoint = {
    attributes: Record<string, any>;
    entity_id: string;
    last_changed: string;
    last_updated: string;
    state: string;
}

export type PostEventsTypeBody = Record<string, any> | {};
export type PostEventTypeEndpoint = {
    message: string;
}

export type PostServicesDomainServiceQuery = {
    return_response?: "";
}
export type PostServicesDomainServiceBody = Record<string, any> | {};
export type PostServicesDomainServiceEndpoint = {
    attributes: Record<string, any> | {};
    entity_id: string;
    last_changed: string;
    state: string;
}[] | {
    changed_states: {
        attributes: Record<string, any> | {};
        entity_id: string;
        last_changed: string;
        state: string;
    }[];
    service_response: Record<string, any>;
};

export type PostTemplateBody = {
    template: string;
}
export type PostTemplateEndpoint = string;

export type PostConfigCoreCheckConfigEndpoint = {
    errors: null | string;
    result: "valid" | "invalid";
}