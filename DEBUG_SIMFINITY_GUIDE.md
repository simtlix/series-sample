# Debugging Simfinity.js Async Functions

This guide explains how to debug Simfinity.js async functions with proper breakpoint support.

## 🚀 Quick Start

### Option 1: Launch with Debug (Recommended)
1. Open VS Code in the project root
2. Go to Run and Debug (Ctrl+Shift+D / Cmd+Shift+D)
3. Select "Debug Simfinity with Async Stack Traces"
4. Click the play button or press F5
5. Set breakpoints in your code and Simfinity async functions

### Option 2: Attach to Running Process
1. Start the server manually:
   ```bash
   node --inspect=0.0.0.0:9229 --async-stack-traces index.js
   ```
2. In VS Code, select "Attach to Simfinity Process"
3. Click the play button or press F5

## 🎯 Key Features

### Async Stack Traces
- `--async-stack-traces` flag provides full async call stack information
- Allows debugging through async/await chains
- Shows complete error traces for async functions

### Source Maps
- Automatically resolves source maps for better debugging
- Allows setting breakpoints in original source code
- Skips Node.js internals for cleaner debugging

### Breakpoint Support
You can set breakpoints in:
- ✅ Your custom resolvers
- ✅ Simfinity async resolvers (in `node_modules/@simtlix/simfinity-js/src/index.js`)
- ✅ Field validators
- ✅ Controllers (onSaving, onUpdating, onDelete)
- ✅ Custom scalars

## 🔍 Debugging Simfinity Async Resolvers

### Where to Set Breakpoints

1. **Collection Field Resolvers** (around line 1650 in simfinity-js):
   ```javascript
   fieldEntry.resolve = async (parent) => {
     // Set breakpoint here to debug collection queries
     const relatedTypeInfo = typesDict.types[relatedType.name];
     // ... rest of resolver
   };
   ```

2. **Single Object Field Resolvers** (around line 1680 in simfinity-js):
   ```javascript
   fieldEntry.resolve = async (parent) => {
     // Set breakpoint here to debug single object queries
     const relatedTypeInfo = typesDict.types[relatedType.name];
     // ... rest of resolver
   };
   ```

3. **Your Custom Resolvers**:
   ```javascript
   // In your type files
   simfinity.connect(serieType, {
     onSaving: async (data, context) => {
       // Set breakpoint here
       console.log('Saving serie:', data);
     }
   });
   ```

### Debug Variables

When debugging, you can inspect:
- `parent` - The parent object being resolved
- `relatedTypeInfo` - Information about the related type
- `query` - The database query being executed
- `result` - The query results
- `context` - GraphQL context (in custom resolvers)

## 🛠️ Troubleshooting

### Breakpoints Not Hit
1. Ensure you're using the correct debug configuration
2. Check that `--async-stack-traces` is enabled
3. Verify source maps are working
4. Try setting breakpoints in your own code first

### Async Stack Not Showing
1. Make sure `--async-stack-traces` flag is present
2. Check that Node.js version supports async stack traces
3. Restart the debug session

### Can't Debug node_modules
1. The configuration includes `node_modules` in source map resolution
2. Ensure you're setting breakpoints in the actual source files
3. Check that the files haven't been minified

## 📝 Example Debug Session

1. Start debugging with "Debug Simfinity with Async Stack Traces"
2. Set a breakpoint in your GraphQL query resolver
3. Set another breakpoint in Simfinity's auto-generated resolver
4. Execute a GraphQL query
5. Step through the async call chain
6. Inspect variables at each step

## 🔧 Advanced Configuration

### Custom Runtime Args
You can modify the launch configuration to add more Node.js flags:
```json
"runtimeArgs": [
  "--inspect=0.0.0.0:9229",
  "--async-stack-traces",
  "--max-old-space-size=4096"
]
```

### Environment Variables
Add custom environment variables for debugging:
```json
"env": {
  "NODE_ENV": "development",
  "DEBUG": "simfinity:*",
  "LOG_LEVEL": "debug"
}
```

## 🎉 Tips

- Use `console.log` statements with unique prefixes (like `🔍 Debug`) for tracing
- Set conditional breakpoints for specific conditions
- Use the debug console to evaluate expressions
- Check the call stack panel to see the async chain
- Use step over (F10) vs step into (F11) strategically

Happy debugging! 🚀
