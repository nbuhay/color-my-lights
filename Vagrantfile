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
  
    # forward more ports to guest VM here
    config.vm.network "forwarded_port", guest: 8000, host: 8000
  end