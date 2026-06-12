#!/usr/bin/env python3
import os
import re
import sys
import json
import argparse

def main():
    parser = argparse.ArgumentParser(description="Automate version bumping across e-Patra workspace files.")
    parser.add_argument("bump_type", choices=["major", "minor", "patch"], nargs="?", default="patch",
                        help="The part of the version to bump (default: patch)")
    parser.add_argument("--set", dest="new_version", help="Directly set a specific version (e.g., 1.0.6)")
    
    args = parser.parse_args()
    
    # Resolve project root relative to this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir = os.path.abspath(os.path.join(script_dir, ".."))
    
    package_json_path = os.path.join(root_dir, "frontend", "package.json")
    tauri_conf_path = os.path.join(root_dir, "frontend", "src-tauri", "tauri.conf.json")
    cargo_toml_path = os.path.join(root_dir, "frontend", "src-tauri", "Cargo.toml")
    pom_xml_path = os.path.join(root_dir, "backend", "pom.xml")
    
    # 1. Read current version from package.json
    if not os.path.exists(package_json_path):
        print(f"[ERROR] Could not find package.json at {package_json_path}")
        sys.exit(1)
        
    with open(package_json_path, "r", encoding="utf-8") as f:
        package_json = json.load(f)
    
    old_version = package_json.get("version", "1.0.0")
    
    # 2. Determine new version
    if args.new_version:
        new_version = args.new_version
    else:
        # Parse version
        match = re.match(r"^(\d+)\.(\d+)\.(\d+)(.*)$", old_version)
        if not match:
            print(f"[ERROR] Invalid version format in package.json: '{old_version}'")
            sys.exit(1)
            
        major, minor, patch, suffix = match.groups()
        major, minor, patch = int(major), int(minor), int(patch)
        
        if args.bump_type == "major":
            major += 1
            minor = 0
            patch = 0
        elif args.bump_type == "minor":
            minor += 1
            patch = 0
        elif args.bump_type == "patch":
            patch += 1
            
        new_version = f"{major}.{minor}.{patch}{suffix}"
        
    print(f"Bumping version: {old_version} -> {new_version}")
    
    # 3. Update package.json
    package_json["version"] = new_version
    with open(package_json_path, "w", encoding="utf-8") as f:
        json.dump(package_json, f, indent=2)
        f.write("\n")
    print(f"Updated {os.path.relpath(package_json_path, root_dir)}")
    
    # 4. Update tauri.conf.json
    if os.path.exists(tauri_conf_path):
        with open(tauri_conf_path, "r", encoding="utf-8") as f:
            tauri_conf = json.load(f)
            
        if "package" in tauri_conf:
            tauri_conf["package"]["version"] = new_version
            with open(tauri_conf_path, "w", encoding="utf-8") as f:
                json.dump(tauri_conf, f, indent=2)
                f.write("\n")
            print(f"Updated {os.path.relpath(tauri_conf_path, root_dir)}")
            
    # 5. Update Cargo.toml
    if os.path.exists(cargo_toml_path):
        with open(cargo_toml_path, "r", encoding="utf-8") as f:
            cargo_content = f.read()
            
        # Replace version = "X.Y.Z" under [package]
        package_index = cargo_content.find("[package]")
        if package_index != -1:
            version_pattern = r'version\s*=\s*"[^"]*"'
            match = re.search(version_pattern, cargo_content[package_index:])
            if match:
                old_version_line = match.group(0)
                new_version_line = f'version = "{new_version}"'
                
                # Replace only in the [package] section
                before_package = cargo_content[:package_index]
                after_package = cargo_content[package_index:].replace(old_version_line, new_version_line, 1)
                
                with open(cargo_toml_path, "w", encoding="utf-8") as f:
                    f.write(before_package + after_package)
                print(f"Updated {os.path.relpath(cargo_toml_path, root_dir)}")
                
    # 6. Update pom.xml
    if os.path.exists(pom_xml_path):
        with open(pom_xml_path, "r", encoding="utf-8") as f:
            pom_content = f.read()
            
        # Match <artifactId>e-patra</artifactId> and the following <version> tag
        pom_pattern = r"(<artifactId>e-patra</artifactId>\s*<version>)([^<]+)(</version>)"
        match = re.search(pom_pattern, pom_content)
        if match:
            old_pom_version = match.group(2)
            # Maintain -SNAPSHOT suffix if present
            is_snapshot = old_pom_version.endswith("-SNAPSHOT")
            new_pom_version = f"{new_version}-SNAPSHOT" if is_snapshot else new_version
            
            replacement = rf"\g<1>{new_pom_version}\g<3>"
            pom_content = re.sub(pom_pattern, replacement, pom_content)
            
            with open(pom_xml_path, "w", encoding="utf-8") as f:
                f.write(pom_content)
            print(f"Updated {os.path.relpath(pom_xml_path, root_dir)} to {new_pom_version}")

    print("Success! Version bump completed.")

if __name__ == "__main__":
    main()
