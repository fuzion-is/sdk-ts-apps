import {
    AppInvokeApi,
    AppInvokeEvent,
    AppInvokeRequest,
    AppInvokeResponse, AppInvokeResponseStatus,
    AppInvokeSchedule,
    AppTriggerType
} from './models'

export type AppConfig<ConfigKeyType> = {
    key: ConfigKeyType
    value: string
}

export type ApiHandlerType<StateType, ConfigKeyType, EventDataType> = (
    app: Apps<StateType, ConfigKeyType, EventDataType>,
    api: AppInvokeApi
) => Promise<AppInvokeResponse<StateType>>

export type EventHandlerType<StateType, ConfigKeyType, EventDataType> = (
    app: Apps<StateType, ConfigKeyType, EventDataType>,
    event: AppInvokeEvent<EventDataType>
) => Promise<AppInvokeResponse<StateType>>

export type ScheduleHandlerType<StateType, ConfigKeyType, EventDataType> = (
    app: Apps<StateType, ConfigKeyType, EventDataType>,
    api: AppInvokeSchedule
) => Promise<AppInvokeResponse<StateType>>

export interface IApps<StateType, ConfigKeyType, EventDataType> {
    addApiHandler(handler: ApiHandlerType<StateType, ConfigKeyType, EventDataType>): void
    addEventHandler(handler: EventHandlerType<StateType, ConfigKeyType, EventDataType>): void
    addScheduleHandler(handler: ScheduleHandlerType<StateType, ConfigKeyType, EventDataType>): void

    run(): Promise<AppInvokeResponse<StateType>>

    c(key: ConfigKeyType): string | undefined

    // @param state object to store
    // @param replaced boolean set to false merge the actual state (default true)
    pushState(state: StateType, replaced: boolean): void

    createResponse(status: AppInvokeResponseStatus, body: string, isBase64: boolean): AppInvokeResponse<StateType>
}

export class Apps<StateType, ConfigKeyType, EventDataType> implements IApps<StateType, ConfigKeyType, EventDataType> {
    private readonly triggerType: AppTriggerType
    private readonly config: AppConfig<ConfigKeyType>[]
    private readonly api?: AppInvokeApi | undefined
    private readonly event?: AppInvokeEvent<EventDataType> | undefined
    private readonly schedule?: AppInvokeSchedule | undefined
    private state: StateType

    private apiHandler: ApiHandlerType<StateType, ConfigKeyType, EventDataType> | undefined
    private eventHandler: EventHandlerType<StateType, ConfigKeyType, EventDataType> | undefined
    private scheduleHandler: ScheduleHandlerType<StateType, ConfigKeyType, EventDataType> | undefined

    constructor(data: AppInvokeRequest<EventDataType>) {
        if (undefined === ['api', 'event', 'schedule'].find(x => x === data.trigger_type)) {
            throw new Error(`Trigger type must be one of ['api', 'event', 'schedule']`)
        }
        this.triggerType = data.trigger_type
        // @ts-ignore
        this.state = data.state
        // @ts-ignore
        this.config = data.config
        this.api = data.api
        this.event = data.event
        this.schedule = data.schedule
    }

    c(key: ConfigKeyType): string | undefined {
        return this.config.find(c => c.key === key)?.value
    }

    pushState(state: StateType, replaced: boolean = true): void {
        this.state = {
            ...(replaced ? {} : this.state),
            ...state,
        }
    }

    createResponse(status: AppInvokeResponseStatus, body: string = '', isBase64: boolean = false): AppInvokeResponse<StateType> {
        return {
            status,
            body,
            is_base_64_encoded: isBase64,
            state: this.state,
        }
    }

    addApiHandler(handler: ApiHandlerType<StateType, ConfigKeyType, EventDataType>): void {
        this.apiHandler = handler
    }

    addEventHandler(handler: EventHandlerType<StateType, ConfigKeyType, EventDataType>): void {
        this.eventHandler = handler
    }

    addScheduleHandler(handler: ScheduleHandlerType<StateType, ConfigKeyType, EventDataType>): void {
        this.scheduleHandler = handler
    }

    async run(): Promise<AppInvokeResponse<StateType>> {
        if ('api' === this.triggerType && this.api) {
            if (!this.apiHandler) {
                throw new Error('trigger handler API is missing')
            }
            return this.apiHandler(this, this.api)
        }

        if ('event' === this.triggerType && this.event) {
            if (!this.eventHandler) {
                throw new Error('trigger handler EVENT is missing')
            }
            return this.eventHandler(this, this.event)
        }

        if ('schedule' === this.triggerType && this.schedule) {
            if (!this.scheduleHandler) {
                throw new Error('trigger handler SCHEDULE is missing')
            }
            return this.scheduleHandler(this, this.schedule)
        }

        throw new Error('internal error during trigger execution')
    }
}
