#!/bin/bash
set -e

VM_NAME="${VM_NAME:-camisole}"
DISK="${DISK:-disk.qcow2}"
DISK_SIZE="${DISK_SIZE:-5G}"
IMAGE_URL="${IMAGE_URL:-https://cloud.debian.org/images/cloud/trixie/latest/debian-13-generic-amd64.qcow2}"
SSH_PORT="${SSH_PORT:-2222}"

WORKDIR="/vm"
SEED_ISO="$WORKDIR/seed.iso"

cd "$WORKDIR"

echo "[*] Starting VM bootstrap..."

if [ ! -f "$DISK" ]; then
echo "[*] Downloading cloud image..."
curl -L -o "$DISK" "$IMAGE_URL"
fi


echo "[*] Checking disk size..."
CURRENT_SIZE=$(qemu-img info --output=json "$DISK" | jq -r '."virtual-size"')
TARGET_SIZE=$(numfmt --from=iec "$DISK_SIZE")

if [ "$CURRENT_SIZE" -lt "$TARGET_SIZE" ]; then
echo "[*] Resizing disk to $DISK_SIZE..."
qemu-img resize "$DISK" "$DISK_SIZE"
fi


echo "[*] Generating cloud-init..."

cat > user-data <<'EOF'
#cloud-config
growpart:
  devices: [/]
  mode: auto
  ignore_growpart_errors: false

resize_rootfs: true
ssh_pwauth: true

user_help:
  lock_passwd: false

users:
  - name: camisole
    groups: wheel
    sudo: ALL=(ALL) NOPASSWD:ALL
    shell: /bin/bash
    passwd: $6$KYaxkJk9xzPumFKN$jvfK48n4fXib3Mz15D0BNt7Mu1k.4mQ/xkSHW9lKm3sztwJRlEeKrkesTJjyWzpl1BqAanZe6a1FBxLZUOK7X/
    lock_passwd: false

packages:
  - build-essential
  - git
  - python3
  - python3-pip
  - python3-venv
  - libcap-dev
  - passwd
  - sudo
  - libsystemd-dev
  - pkg-config
  - quota
  - python3-setuptools
  - python3-wheel

write_files:
  - path: /etc/systemd/system/camisole.service
    permissions: '0644'
    owner: root:root
    content: |
      [Unit]
      Description=Camisole Judge Server
      After=network.target isolate.service
      Requires=isolate.service

      [Service]
      Type=simple
      User=camisole
      Group=isolate
      ExecStart=/usr/local/bin/camisole serve
      WorkingDirectory=/opt/camisole
      Restart=always
      RestartSec=5
      Environment=PYTHONUNBUFFERED=1

      [Install]
      WantedBy=multi-user.target

runcmd:
  - sed -i 's/^#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config
  - sed -i 's/PasswordAuthentication no/PasswordAuthentication yes/' /etc/ssh/sshd_config
  - service sshd restart
  - |
    cd /tmp
    git clone --depth=1 https://github.com/ioi/isolate.git
    cd isolate
    git fetch --unshallow # dirty patch, head is broken --start
    git checkout a918ac007fdfbfddc9a045d500cf72e3cd330e5b # -- end

    make isolate
    make install  

  - ln -s /usr/local/etc/isolate /etc/isolate
  - ln -s /usr/local/bin/isolate /usr/bin/isolate
  - mkdir -p /etc/systemd/system/isolate.target.wants/
  - ln -s /usr/local/lib/systemd/system/isolate.service /etc/systemd/system/isolate.target.wants/isolate.service
  - chmod -R 644 /etc/systemd/system/isolate.target.wants/
  - systemctl daemon-reload 
  - mkdir -p /var/lib/isolate
  - sed -i "s|/var/local/lib/isolate|/var/lib/isolate|" /usr/local/etc/isolate || true
  - groupadd -r isolate
  - usermod -aG isolate camisole
  - |
    for i in $(seq 0 9); do
      useradd -r -M -g isolate -s /bin/false isolate$i || true
    done
  - chown root:isolate /usr/local/bin/isolate
  - chmod u+s /usr/local/bin/isolate
  
  - systemctl enable --now isolate.service
  - python3 -m pip install aiohttp msgpack PyYAML --break-system-packages
  - |
    cd /opt
    git clone https://github.com/devdl11/camisole.git
    cd camisole
    python3 setup.py build
    python3 setup.py install

  - systemctl enable --now camisole

final_message: "The system is finally up, after $UPTIME seconds"

EOF

cat > meta-data <<EOF
instance-id: $(uuidgen 2>/dev/null || echo "camisole-id")
local-hostname: camisole
EOF

echo "[*] Building seed ISO..."
cloud-localds "$SEED_ISO" user-data meta-data

echo "[*] Launching QEMU..."

exec qemu-system-x86_64 \
  -m 2048 \
  -smp 2 \
  -drive file="$DISK",format=qcow2,if=virtio \
  -cdrom "$SEED_ISO" \
  -nic user,model=virtio,hostfwd=tcp::2222-:22,hostfwd=tcp::42920-:42920 \
  -nographic \
  -serial mon:stdio