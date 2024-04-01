export interface NilNode<P = Record<string, unknown>> {
    type: string
    props: P
    children: NilNode[]
}

export interface HostContainer {
    head: NilNode | null
}

export interface HostConfig {
    type: string
    props: Record<string, unknown>
    container: HostContainer
    instance: NilNode
    textInstance: NilNode
    suspenseInstance: NilNode
    hydratableInstance: never
    publicInstance: null
    hostContext: null
    updatePayload: {}
    childSet: never
    timeoutHandle: number
    noTimeout: -1
}


