# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
    config.vm.define "color-my-lights" # vagrant cli
    config.vm.box = "bento/ubuntu-16.04"
    
    config.vm.provider "virtualbox" do |vb|
      vb.name = "color-my-lights" # virtualbox GUI
      vb.memory = 3072
    end
    
    config.vm.hostname = "color-my-lights"
  
    # provision Docker
    # install containers
    #   aws dynamodb
    config.vm.provision "docker" do |d|

        d.pull_images "amazon/dynamodb-local"
        d.run "dynamodb",
          image: "amazon/dynamodb-local",
          args: "--network bridge -p 8000:8000"
    end

    config.vm.provision "shell",
      inline: <<-SHELL
        # clone bu-toolbox
        git clone --depth 1 https://github.com/nbuhay/bu-toolbox.git
        # install Node.js and awscli
        chmod u+x ./bu-toolbox/linux/ubuntu/install/nodejs.sh
        ./bu-toolbox/linux/ubuntu/install/nodejs.sh
        chmod u+x ./bu-toolbox/linux/ubuntu/install/awscli.sh      
        ./bu-toolbox/linux/ubuntu/install/awscli.sh
      SHELL

    # forward more ports to guest VM here
    config.vm.network "forwarded_port", guest: 8000, host: 8000
    config.vm.network "forwarded_port", guest: 8080, host: 8080
    config.vm.synced_folder ".", "/vagrant", mount_options: ["dmode=755", "fmode=755"]
  end