def failed = false

pipeline {
    agent any
    
    environment {        
        WWW = "${env.BRANCH_NAME == "master" ? env.VAULT_STABLE_WWW : env.VAULT_STAGING_WWW}"
        ENV = "${env.BRANCH_NAME == "master" ? env.VAULT_STABLE_ENV : env.VAULT_STAGING_ENV}"
    }

    stages {
        stage('check') {
            steps {
                echo "WWW: ${WWW}"
                echo "ENV: ${ENV}"
                echo "WORKSPACE: ${WORKSPACE}"
                sh 'pwd'
                sh 'ls'

                script {
                    if("${WWW}" == "" || "${ENV}" == "" || ("${env.BRANCH_NAME}" != "master" && "${env.BRANCH_NAME}" != "develop")) {
                        println "INCORRECT VARIABLES"
                        currentBuild.result = 'FAILED'
                        failed = true
                        error "Build failed :-("
                        return
                    }
                }
            }
        }    

        stage('copy env') {
            steps {
                sh "cp -a ${ENV}/. ${WORKSPACE}"
            }
        }

        stage('LS') {
            steps {
                sh "ls -a ./"
                sh "ls -a ${ENV}"
            }
        }

        stage('Build') {
            steps {
                sh 'npm install'
                sh 'npm run build'
            }
        }

        stage('deploy') {
            when {
                expression {
                    !failed
                }
            }
            
            steps{
                sh "rm -rf ${WWW}"
                sh "mv ${WORKSPACE}/dist ${WWW}"
            }
        }
    }
}