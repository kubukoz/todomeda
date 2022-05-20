{ gitignore-source, mkYarnPackage }:
let
  pname = "todomeda";
  version = "0.0.0";
in
mkYarnPackage {
  inherit pname version;
  src = gitignore-source.lib.gitignoreSource ./.;

  packageJSON = ./package.json;
  yarnLock = ./yarn.lock;

  buildPhase = ''
    yarn build
  '';

  installPhase = ''
    cp -R deps/todomeda/dist $out
  '';

  distPhase = "true";
}
