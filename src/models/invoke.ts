export type AppTriggerType = 'api' | 'event' | 'schedule'

export type AppInvokeResponseStatus = 'SUCCEEDED' | 'FAILED'

export type AppInvokeResponse<StateType> = {
    status: AppInvokeResponseStatus
    body: string
    is_base_64_encoded: boolean
    state: StateType
}

export type AppInvokeRequest<EventDataType> = {
    trigger_type: AppTriggerType
    api?: AppInvokeApi
    event?: AppInvokeEvent<EventDataType>
    schedule?: AppInvokeSchedule
    state: object
    config: {
        key: string
        value: string
    }[]
}

export type AppInvokeApi = {
    headers: {[key: string]: string}
    route_key: string
    route_path: string
    path_parameters?: {[key: string]: string}
    http: {
        method: string
        path: string
        protocol: string
        source_ip: string
        user_agent: string
    }
    body: string
    is_base_64_encoded: boolean
}

export type AppInvokeEvent<EventDataType> = {
    request_id: string
    space_id: string
    event: string
    series: number
    source: string
    resource_id: string
    user_identity: {
        username: string
        user_id: string
    }
    data: EventDataType
}

export type AppInvokeSchedule = {
    rule_key: string
}
