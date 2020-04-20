pipeline {
    agent any
    
    environment {        
        WWW = "${env.BRANCH_NAME == "master" ? env.VAULT_STABLE_WWW : env.VAULT_STAGING_WWW}"
        ENV = "${env.BRANCH_NAME == "master" ? env.VAULT_STABLE_ENV : env.VAULT_STAGING_ENV}"
    }

    stages {
        stage('check') {
            steps {
                script {
                    if("${WWW}" == "" || "${ENV}" == "") {
                        currentBuild.result = 'FAILED'
                        error "No valid deploy dirs"
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

        stage('build') {
            steps {
                sh 'npm install'
                sh 'npm build'
            }
        }

        stage('deploy') {
            when {
                anyOf { branch 'master'; branch 'develop' }
            }

            steps{
                sh "rm -rf ${WWW}"
                sh "mv ${WORKSPACE}/dist ${WWW}"
            }
        }
    }
}