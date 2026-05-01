# SALS

Simple Ansible Language Server.

This repository contains only the standalone language server extracted from the
larger vscode-ansible monorepo.

## Requirements

- Node.js 24+
- Ansible 2.9+
- ansible-lint (optional if you disable validation)
- yamllint (optional)

## Build

```bash
pnpm install
pnpm run build
```

## Run

```bash
node dist/cli.cjs --stdio
```

## Neovim example

```lua
require("lspconfig").ansiblels.setup({
  cmd = { "node", "/path/to/sals/dist/cli.cjs", "--stdio" },
  filetypes = { "yaml.ansible", "ansible" },
})
```
