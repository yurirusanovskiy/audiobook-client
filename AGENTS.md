<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Material UI (MUI) Rules
1. **Icon Imports**: Always use the `-Outlined` suffix for outlined icons in Material UI v5+ (e.g. `import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutlined';` instead of `PauseCircleOutline`).
2. **Menu/Dialog Props**: Avoid using `PaperProps` directly. Use the modern `slotProps={{ paper: { sx: ... } }}` to prevent TypeScript interface errors.

# Backend & Error Handling Rules
1. **Third-Party ML Libraries**: Always wrap calls to fragile third-party ML processing libraries (like ruaccent or ONNX models) in `try/except` blocks. If they fail, gracefully fallback to the original text rather than crashing the API with a 500 Internal Server Error.
