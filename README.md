# AI Agents Custom Streaming with Dual Agent Support

This project demonstrates a streaming implementation that merges outputs from two AI agents simultaneously, including tool calls and results, using AI SDK's `createDataStreamResponse` and `useChat` with custom data stream handling.

## Features

- **Dual Agent Streaming**: Simultaneously streams responses from two separate AI agents
- **Full Stream Support**: Captures text, tool calls, and tool results using `fullStream`
- **AI SDK Integration**: Uses `createDataStreamResponse` and `useChat` for robust streaming
- **Visual Differentiation**: Each agent's response is visually distinguished with unique colors
- **Tool Call Visualization**: Shows tool calls and results with distinct styling
- **Real-time Updates**: Messages update as they stream in from each agent
- **Extensible Color System**: Ready for future expansion to more agents

## Implementation Details

### API Route (`app/api/chat/route.ts`)

The API route creates two concurrent agent streams:

1. **Dual Streams**: Creates `stream1` and `stream2` using `generalAgent.stream(messages)`
2. **Stream Merging**: Merges both streams by adding `streamId` to each chunk
3. **Chunk Preservation**: Sends original chunks with just `streamId` added: `{ streamId: 'stream1', ...chunk }`
4. **Concurrent Processing**: Uses `Promise.all()` to handle both streams simultaneously

### Frontend (`app/page.tsx`)

The React implementation processes dual agent streams:

1. **Stream Processing**: Handles `stream1` and `stream2` from the data stream
2. **Color Assignment**: Automatic color assignment based on stream ID
3. **Real-time Updates**: Streaming updates for both agents
4. **Tool Handling**: Processes tool calls and results for each agent

### Visual Design

- **stream1**: Blue theme (blue avatar, blue-tinted message background)
- **stream2**: Green theme (green avatar, green-tinted message background)
- **Tool Visualization**: Orange badges for tool calls, green badges for results
- **Extensible Colors**: 8-color palette ready for future agent expansion

## Color System

The ChatMessage component includes a full color palette for future expansion:

1. **Blue** - Currently used for stream1
2. **Green** - Currently used for stream2
3. **Purple** - Ready for stream3
4. **Orange** - Ready for stream4
5. **Pink** - Ready for stream5
6. **Indigo** - Ready for stream6
7. **Teal** - Ready for stream7
8. **Red** - Ready for stream8

Colors are assigned consistently based on stream ID hash, ensuring the same stream always gets the same color.

## Stream Event Types

| Event Type    | Description           | Data Included                      |
| ------------- | --------------------- | ---------------------------------- |
| `text-delta`  | Text content chunks   | `textDelta`                        |
| `tool-call`   | Tool invocation       | `toolCallId`, `toolName`, `args`   |
| `tool-result` | Tool execution result | `toolCallId`, `toolName`, `result` |
| `finish`      | Stream completion     | `finishReason`, `usage`            |

## Usage

1. Start the development server: `npm run dev`
2. Navigate to the chat interface
3. Send a message to see responses from both agents simultaneously
4. Each agent's response will appear in its own message bubble with distinct styling
5. Tool calls and results will be displayed with visual indicators

## Data Flow

```
User Message → API Route → [stream1, stream2] → Merged Stream → Frontend → Dual Display
```

1. **User sends message** via chat interface
2. **API creates two streams** from the same message
3. **Streams are merged** with `streamId` identifiers
4. **Frontend processes** each stream separately
5. **Messages display** with agent-specific styling

## Key Benefits

- **Simple Implementation**: Clean, straightforward dual-agent setup
- **Real-time Performance**: Concurrent streaming from both agents
- **Visual Clarity**: Clear differentiation between agent responses
- **Tool Transparency**: Full visibility into agent tool usage
- **AI SDK Integration**: Leverages proven streaming infrastructure
- **Future Ready**: Extensible color system for more agents
- **Type Safety**: Full TypeScript support throughout

## Future Expansion

The implementation is designed for easy expansion:

- **More Agents**: Add stream3, stream4, etc. with automatic color assignment
- **Agent Configuration**: Easy to add agent-specific settings
- **Custom Routing**: Send different messages to different agents
- **Agent Types**: Support for specialized agent roles

This implementation provides a solid foundation for dual-agent scenarios while maintaining real-time streaming performance and full compatibility with the AI SDK ecosystem.
