/*
 * this is like a super event type of our current event type ddl
 * 
 * 
 * 
 * 
 * 
 */
export enum EventType {
    DomContentLoaded,
    Load,
    FullSnapshot,
    IncrementalSnapshot,
    Meta
}

export type domContentLoadedEvent = {
    type: EventType.DomContentLoaded;
    data: unknown;
};

export type loadedEvent = {
    type: EventType.Load;
    data: unknown;
};

export type fullSnapshotEvent = {
    type: EventType.FullSnapshot;
    data: {
        node: serializedNodeWithId;  // foreign key of seralized node
        initialOffset: {
            top: number;
            left: number;
        };
    };
};
export type incrementalSnapshotEvent = {
    type: EventType.IncrementalSnapshot;
    data: incrementalData;  // foreign key of event
};

export type metaEvent = {
    type: EventType.Meta;
    data: {
        href: string;
        width: number;
        height: number;
    };
};
/*
 * basically our current event ddl but more
 * 
 * 
 * 
 * 
 * 
 */
export enum IncrementalSource {
    Mutation,
    MouseMove,
    MouseInteraction,
    Scroll,
    ViewportResize,
    Input,
    TouchMove,
    MediaInteraction,
    StyleSheetRule,
    CanvasMutation,
    Font,
    Log,
    Drag,
    StyleDeclaration,
    Selection,
    AdoptedStyleSheet,
    CustomElement,
}

export type mutationData = {
    source: IncrementalSource.Mutation;
    texts: textMutation[];
    attributes: attributeMutation[];
    removes: removedNodeMutation[];
    adds: addedNodeMutation[];
    isAttachIframe?: true;
};

export type mousemoveData = {
    source:
    | IncrementalSource.MouseMove
    | IncrementalSource.TouchMove
    | IncrementalSource.Drag;
    positions: mousePosition[];
};

export type mouseInteractionData = {
    source: IncrementalSource.MouseInteraction;
    type: MouseInteractions;
    id: number;
    x?: number;
    y?: number;
    pointerType?: PointerTypes;
};

export type scrollData = {
    source: IncrementalSource.Scroll;
    id: number;
    x: number;
    y: number;
};

export type viewportResizeData = {
    source: IncrementalSource.ViewportResize;
    width: number;
    height: number;
};

export type inputData = {
    source: IncrementalSource.Input;
    id: number;
    text: string;
    isChecked: boolean;
    userTriggered?: boolean;
};

export type mediaInteractionData = {
    source: IncrementalSource.MediaInteraction;
    type: MediaInteractions;
    id: number;
    currentTime?: number;
    volume?: number;
    muted?: boolean;
    loop?: boolean;
    playbackRate?: number;
};
export enum MediaInteractions {
    Play,
    Pause,
    Seeked,
    VolumeChange,
    RateChange,
}


export type styleSheetRuleData = {
    source: IncrementalSource.StyleSheetRule;
    id?: number;
    styleId?: number;
    removes?: styleSheetDeleteRule[];
    adds?: styleSheetAddRule[];
    replace?: string;
    replaceSync?: string;
};

export type styleDeclarationData = {
    source: IncrementalSource.StyleDeclaration;
    id?: number;
    styleId?: number;
    index: number[];
    set?: {
        property: string;
        value: string | null;
        priority: string | undefined;
    };
    remove?: {
        property: string;
    };
};

export type canvasMutationData = {
    source: IncrementalSource.CanvasMutation;
    property: string;
    args: Array<unknown>;
    setter?: true;
    id: number;
    type: CanvasContext;
    commands: canvasMutationCommand[]
};
export type canvasMutationCommand = {
    property: string;
    args: Array<unknown>;
    setter?: true;
};

export type fontData = {
    source: IncrementalSource.Font;
    family: string;
    fontSource: string;
    buffer: boolean;
    descriptors?: FontFaceDescriptors;
};

export type selectionData = {
    source: IncrementalSource.Selection;
    ranges: Array<SelectionRange>;
};
export type SelectionRange = {
    start: number;
    startOffset: number;
    end: number;
    endOffset: number;
};

export type adoptedStyleSheetData = {
    source: IncrementalSource.AdoptedStyleSheet;
    // id indicates the node id of document or shadow DOMs' host element.
    id: number;
    // New CSSStyleSheets which have never appeared before.
    styles?: {
        styleId: number;
        rules: styleSheetAddRule[];
    }[];
    // StyleSheet ids to be adopted.
    styleIds: number[];
};

export type customElementData = {
    source: IncrementalSource.CustomElement;
    define?: {
        name: string;
    };
};

export type incrementalData =
    | mutationData
    | mousemoveData
    | mouseInteractionData
    | scrollData
    | viewportResizeData
    | inputData
    | mediaInteractionData
    | styleSheetRuleData
    | canvasMutationData
    | fontData
    | selectionData
    | styleDeclarationData
    | adoptedStyleSheetData
    | customElementData;

export type eventWithoutTime =
    | domContentLoadedEvent
    | loadedEvent
    | fullSnapshotEvent
    | incrementalSnapshotEvent
    | metaEvent;

export type eventWithTime = eventWithoutTime & {
    timestamp: number;
    delay?: number;
};

export type canvasEventWithTime = eventWithTime & {
    type: EventType.IncrementalSnapshot;
    data: canvasMutationData;
};

// https://dom.spec.whatwg.org/#interface-mutationrecord
export type mutationRecord = Readonly<{
    type: string;
    target: Node;
    oldValue: string | null;
    addedNodes: NodeList;
    removedNodes: NodeList;
    attributeName: string | null;
}>;

export type textCursor = {
    node: Node;
    value: string | null;
};
export type textMutation = {
    id: number;
    value: string | null;
};

export type styleOMValue = {
    [key: string]: styleValueWithPriority | string | false;
};

export type styleValueWithPriority = [string, string];

export type attributeCursor = {
    node: Node;
    attributes: {
        [key: string]: string | styleOMValue | null;
    };
    styleDiff: styleOMValue;
    _unchangedStyles: styleOMValue;
};
export type attributeMutation = {
    id: number;
    attributes: {
        [key: string]: string | styleOMValue | null;
    };
};

export type removedNodeMutation = {
    parentId: number;
    id: number;
    isShadow?: boolean;
};

export type addedNodeMutation = {
    parentId: number;
    // Newly recorded mutations will not have previousId any more, just for compatibility
    previousId?: number | null;
    nextId: number | null;
    node: serializedNodeWithId;
};

export type mutationCallbackParam = {
    texts: textMutation[];
    attributes: attributeMutation[];
    removes: removedNodeMutation[];
    adds: addedNodeMutation[];
    isAttachIframe?: true;
};

export type mousePosition = {
    x: number;
    y: number;
    id: number;
    timeOffset: number;
};

export type mouseMovePos = {
    x: number;
    y: number;
    id: number;
    debugData: incrementalData;
};

export enum MouseInteractions {
    MouseUp,
    MouseDown,
    Click,
    ContextMenu,
    DblClick,
    Focus,
    Blur,
    TouchStart,
    TouchMove_Departed, // we will start a separate observer for touch move event
    TouchEnd,
    TouchCancel,
}

export enum PointerTypes {
    Mouse,
    Pen,
    Touch,
}

export enum CanvasContext {
    '2D',
    WebGL,
    WebGL2,
}

export type SerializedCanvasArg =
    | {
        rr_type: 'ArrayBuffer';
        base64: string; // base64
    }
    | {
        rr_type: 'Blob';
        data: Array<CanvasArg>;
        type?: string;
    }
    | {
        rr_type: string;
        src: string; // url of image
    }
    | {
        rr_type: string;
        args: Array<CanvasArg>;
    }
    | {
        rr_type: string;
        index: number;
    };

export type CanvasArg =
    | SerializedCanvasArg
    | string
    | number
    | boolean
    | null
    | CanvasArg[];

export type styleSheetAddRule = {
    rule: string;
    index?: number | number[];
};

export type styleSheetDeleteRule = {
    index: number | number[];
};
/*
 * equivalent to Element in our DDL
 * 
 * 
 * 
 * 
 * 
 */
export enum NodeType {
    Document,
    DocumentType,
    Element,
    Text,
    CDATA,
    Comment,
}

export type documentNode = {
    type: NodeType.Document;
    childNodes: serializedNodeWithId[];
    compatMode?: string;
};

export type documentTypeNode = {
    type: NodeType.DocumentType;
    name: string;
    publicId: string;
    systemId: string;
};

type cssTextKeyAttr = {
    _cssText?: string;
};

export type attributes = cssTextKeyAttr & {
    [key: string]: // dyanmic number of properties with these types
| string
| number 
| true   
| null;  
// properties e.g. rr_scrollLeft or rr_mediaCurrentTime
// e.g. checked  on <input type="radio">
// an indication that an attribute was removed (during a mutation)
};

export type elementNode = {
    type: NodeType.Element;
    tagName: string;
    attributes: attributes;
    childNodes: serializedNodeWithId[];
    isSVG?: true;
    needBlock?: boolean;
    // This is a custom element or not.
    isCustom?: true;
};

export type textNode = {
    type: NodeType.Text;
    textContent: string;
};

export type cdataNode = {
    type: NodeType.CDATA;
    textContent: '';
};

export type commentNode = {
    type: NodeType.Comment;
    textContent: string;
};

export type serializedNode = (
    | documentNode
    | documentTypeNode
    | elementNode
    | textNode
    | cdataNode
    | commentNode
) & {
    rootId?: number;
    isShadowHost?: boolean;
    isShadow?: boolean;
};

export type serializedNodeWithId = serializedNode & { id: number };

export type serializedElementNodeWithId = Extract<
    serializedNodeWithId,
    Record<'type', NodeType.Element>
>;