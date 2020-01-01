# -*- mode: ruby -*-
# vi: set ft=ruby :

ANSIBLE_PLAYBOOK = ENV['ANSIBLE_PLAYBOOK'] || "provisioning/site.yml"
VAGRANTFILE_API_VERSION = 2
BOX_NAME = ENV['BOX_NAME'] || "bento/centos-6.7"
BOX_MEM = ENV['BOX_MEM'] || 1536
BOX_CPUS = ENV['BOX_CPUS'] || 2

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  # config.ssh.insert_key = false

  if Vagrant.has_plugin?("vagrant-hostmanager")
    config.hostmanager.enabled = true
    config.hostmanager.manage_host = true
    config.hostmanager.ignore_private_ip = false
    config.hostmanager.include_offline = true
  end

  if Vagrant.has_plugin?("vagrant-cachier")
    # config.cache.scope = :machine
  end

  machines = [
    {:name => 'couchbase1', :ip => '10.1.42.10', :groups => ['couchbase_cluster']},
    {:name => 'couchbase2', :ip => '10.1.42.20', :groups => ['couchbase_cluster']},
    {:name => 'node-serv', :ip => '10.1.42.30', :groups => ['nodejs']},
  ]

  domain_suffix = "dev"
  machines.each_with_index do |machine, index|
    short_name = machine[:name]
    domain_name = "#{short_name}.#{domain_suffix}"
    # machine[:name] = domain_name

    config.vm.define short_name do |host|
      host.vm.box = BOX_NAME
      host.vm.network 'private_network', ip: machine[:ip]
      host.vm.hostname = domain_name
      host.ssh.forward_agent = true

      host.vm.provider :virtualbox do |vb|
        vb.name = short_name

        if machine[:groups].include?("couchbase_cluster")
          vb.memory = BOX_MEM
          vb.cpus = BOX_CPUS
        elsif machine[:groups].include?("nodejs")
          vb.memory = 1024
          vb.cpus = 1
          host.vm.synced_folder "./nodeapp", "/vagrant"
        end

        # vb.customize ["modifyvm", :id, "--ioapic", "on"]
        # vb.customize ["modifyvm", :id, "--natdnshostresolver1", "on"]
        # vb.customize ["modifyvm", :id, "--natdnsproxy1", "on"]
      end # end vm provider

      if index == (machines.length - 1)
        host.vm.provision :ansible do |ansible|
          ansible.playbook = ANSIBLE_PLAYBOOK
          # ansible.verbose = 'vvvv'

          # Disable default limit to connect to all the machines
          ansible.limit = 'all'

          # Use helper method to define machine groups
          ansible.groups = group_up(machines)

          # variable overrides which will be passed in as if used with
          # ansible-playbook --extra-vars option
          ansible.extra_vars = {
            couchbase_server_ram: (BOX_MEM * 0.78).floor,
            ansible_python_interpreter: '/usr/bin/python'
          }
        end # end provision
      end # end if last machine

    end # end vm define

  end # end each_machine
end # end Vagrant config

# Helper method to define machine groupings
def group_up (machines)
  groups = Hash.new
  machines.each do |machine|
    name = machine[:name]
    machine[:groups].each do |group|
      if !groups.has_key?(group)
        groups[group] = Array.new
      end
      group_list = groups[group]
      if !group_list.include?(name)
        group_list.push(name)
      end
    end
  end
  return groups
end
