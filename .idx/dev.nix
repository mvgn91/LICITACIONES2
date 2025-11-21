{ pkgs, ... }: {
  # Let Nixpkgs pass through configurations to git
  # See https://github.com/NixOS/nixpkgs/pull/132516
  # and https://github.com/NixOS/nixpkgs/pull/136934.
  programs.git.config = {
    "remote "origin"" = {
      url = "https://github.com/mvgn/pflicitacion.git";
      fetch = "+refs/heads/*:refs/remotes/origin/*";
    };
  };
  # Used by the file-changes-action to track changes
  # across sessions.
  per-session-init = ''
    if [ -f ".idx/dev.json" ]; then
      cp .idx/dev.json .idx/dev.json.bak
    fi
  '';
  # Set the version of Nixpkgs to be used.
  channel = "stable-23.11"; # or "unstable"
  # Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.nodejs_20 # Bun is also available with pkgs.bun
  ];
  # Sets environment variables in the workspace
  env = {};
  # Functions to run on workspace startup
  startup = {
    # This is a one-time setup that will not run again on subsequent refreshes.
    once = {
      # Add your one-time setup steps here
    };
    # Commands to run on every workspace startup
    always = {
      # Add your commands here
    };
  };

  # Use Devbox to configure your environment.
  # See https://www.jetpack.io/devbox/docs/ for reference.
  devbox.enable = true;

  # IDX specific settings
  idx = {
    # Populates the file explorer with the files you want to work on.
    main = {
      "src/app/page.tsx" = "split-right";
      "src/app/actions.ts" = "split-right";
    };
    # Enable previews and customize configuration
    previews = {
      enable = true;
      previews = {
        web = {
          command = ["npm" "run" "dev" "--" "--hostname" "0.0.0.0"];
          manager = "web";
        };
      };
    };
    # The following attributes are used to configure the client IDE
    client = {
      # The theme to use in the editor
      theme = "github-dark";
      # The font to use in the editor
      font = {
        family = "FiraCode-Retina";
        size = 14;
      };
    };
  };
}
