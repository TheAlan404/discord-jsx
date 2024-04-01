import { ActionRowBuilder, APIEmbed, BaseMessageOptions, ButtonBuilder, ButtonInteraction, ButtonStyle, Client, ColorResolvable, EmojiResolvable, InteractionCollector, resolveColor } from "discord.js";
import Reconciler from 'react-reconciler'
import { DefaultEventPriority, ConcurrentRoot } from 'react-reconciler/constants.js'
import { HostConfig, HostContainer, NilNode } from "./types.js";
import { MaybePromise, randomId } from "./utils.js";

export type SelectTagTypes = "string" | "user" | "role" | "channel";

declare module 'react' {
    namespace JSX {
        interface IntrinsicElements {
            msg: {},
            embed: {
                title?: string,
                color?: ColorResolvable,
                children?: React.ReactNode,
            },
            row: { children?: React.ReactNode },
            button: {
                id?: string,
                children?: React.ReactNode,
                style?: ButtonStyle,
                disabled?: boolean,
                emoji?: EmojiResolvable,
                url?: string,
                onClick?: () => MaybePromise<void>,
            },
        }
    }
}

// react-reconciler exposes some sensitive props. We don't want them exposed in public instances
const REACT_INTERNAL_PROPS = ['ref', 'key', 'children']
function getInstanceProps(props: Reconciler.Fiber['pendingProps']): HostConfig['props'] {
    const instanceProps: HostConfig['props'] = {}

    for (const key in props) {
        if (!REACT_INTERNAL_PROPS.includes(key)) instanceProps[key] = props[key]
    }

    return instanceProps
}

export const createJSXRenderer = (
    client: Client,
    component: React.ReactNode,
    updateMessage: (message: BaseMessageOptions) => Promise<void> | void
) => {
    const container: HostContainer = { head: null };

    const render = () => {
        if(!container.head) return;
        let payload = parseRoot(client, container.head);
        updateMessage(payload);
    }

    const reconciler = Reconciler<
        HostConfig['type'],
        HostConfig['props'],
        HostConfig['container'],
        HostConfig['instance'],
        HostConfig['textInstance'],
        HostConfig['suspenseInstance'],
        HostConfig['hydratableInstance'],
        HostConfig['publicInstance'],
        HostConfig['hostContext'],
        HostConfig['updatePayload'],
        HostConfig['childSet'],
        HostConfig['timeoutHandle'],
        HostConfig['noTimeout']
    >({
        isPrimaryRenderer: false,
        supportsMutation: true,
        supportsPersistence: false,
        supportsHydration: false,
        // @ts-ignore
        now: Date.now,
        scheduleTimeout: setTimeout,
        cancelTimeout: clearTimeout,
        noTimeout: -1,
        createInstance: (type, props) => ({ type, props: getInstanceProps(props), children: [] }),
        hideInstance() { },
        unhideInstance() { },
        createTextInstance: (value) => ({ type: 'text', props: { value }, children: [] }),
        hideTextInstance() { },
        unhideTextInstance() { },
        appendInitialChild: (parent, child) => parent.children.push(child),
        appendChild: (parent, child) => parent.children.push(child),
        appendChildToContainer: (container, child) => (container.head = child),
        insertBefore: (parent, child, beforeChild) => parent.children.splice(parent.children.indexOf(beforeChild), 0, child),
        removeChild: (parent, child) => parent.children.splice(parent.children.indexOf(child), 1),
        removeChildFromContainer: (container) => (container.head = null),
        getPublicInstance: () => null,
        getRootHostContext: () => null,
        getChildHostContext: () => null,
        shouldSetTextContent: () => false,
        finalizeInitialChildren: () => false,
        prepareUpdate: () => ({}),
        commitUpdate: (instance, _, __, ___, props) => {
            instance.props = getInstanceProps(props);
            render();
        },
        commitTextUpdate: (instance, _, value) => {
            instance.props.value = value;
            render();
        },
        prepareForCommit: () => null,
        resetAfterCommit() { },
        preparePortalMount() { },
        clearContainer: (container) => (container.head = null),
        // @ts-ignore
        getCurrentEventPriority: () => DefaultEventPriority,
        beforeActiveInstanceBlur: () => { },
        afterActiveInstanceBlur: () => { },
        detachDeletedInstance: () => { },
    })


    let root = reconciler.createContainer(container, ConcurrentRoot, null, false, null, '', console.error, null);

    reconciler.updateContainer(component, root, null, () => render());
};

const getAllText = (node: NilNode): string => {
    return node.children.filter(n => n.type == "text").map(n => n.props.value).join("");
}

const parseRoot = (client: Client, node: NilNode): BaseMessageOptions => {
    if(node.type == "msg") {
        return {
            content: getAllText(node),
            embeds: node.children.filter(n => n.type == "embed").map(parseEmbed),
            components: node.children.filter(n => n.type == "row").map(n => parseRow(client, n)) as any,
        };
    } else {
        throw new Error("ReactNode must return a <msg> element");
    }
}

const parseEmbed = (node: NilNode): APIEmbed => {
    if(node.type !== "embed") return {};

    return {
        description: getAllText(node),
        color: resolveColor((node.props.color || "Default") as ColorResolvable),
    }
}

const parseRow = (client: Client, node: NilNode) => {
    return new ActionRowBuilder()
        .addComponents(
            // @ts-ignore
            node.children.map(n => parseComponent(client, n))
            .filter(x => !!x)
        )
        .toJSON();
}

const parseComponent = (client: Client, node: NilNode) => {
    if(node.type == "button") {
        let id = (node.props.id as string) || `jsx__${randomId()}`;

        let builder = new ButtonBuilder()
            .setCustomId(id)
            .setDisabled((node.props.disabled || false) as boolean)
            .setLabel(getAllText(node))
            .setStyle(node.props.style as ButtonStyle || ButtonStyle.Primary);
        
        if(node.props.url)
            builder.setURL(node.props.url as string);

        if(node.props.onClick) {
            let collector = new InteractionCollector(client as any, {
                filter: (x) => x.customId == id,
                max: 1,
            });

            collector.on("collect", async (i) => {
                await i.deferUpdate({ fetchReply: false });
                (node.props.onClick as (i: ButtonInteraction) => MaybePromise<void>)(i as any);
            });
        }

        return builder;
    } else if (node.type == "select") {
        
    }
}

