import * as React from 'react';
import { TextInput } from "~/components/input/TextInput";
import { Button } from "~/components/input/Button";
import { connect } from 'react-redux';
import { bindActionCreators } from "redux";
import { userSendLoginRequest, userSetLoginError } from "~/redux/user/actions";
import { IUserFormStateLogin, IUserState } from "~/redux/user/reducer";
import { Info } from "~/components/input/Info";

const login = require('~/containers/LoginLayout/style');
const style = require('./style.scss');

interface ILoginFormProps {
  error: IUserFormStateLogin['error'],

  userSendLoginRequest: typeof userSendLoginRequest,
  userSetLoginError: typeof userSetLoginError,
}

interface ILoginFormState {
  username: string,
  password: string,
}

class Component extends React.PureComponent<ILoginFormProps, ILoginFormState> {
  state = {
    username: 'user',
    password: 'password',
  };

  sendRequest = () => {
    console.log('send?');
    this.props.userSendLoginRequest(this.state);
  };

  changeField = <T extends keyof ILoginFormState>(field: T) => ({ target: { value }}: React.ChangeEvent<HTMLInputElement>) => {
    if (this.props.error) this.props.userSetLoginError({ error: null });
    this.setState({ [field]: value } as Pick<ILoginFormState, keyof ILoginFormState>);
  };

  render() {
    const { error } = this.props;
    const { username, password } = this.state;

    return (
      <div className={login.form}>
        <div className={style.container}>
          <div className={style.area_left}>

          </div>
          <div className={style.area_right}>
            <div className={style.area_sign}>
              РЕШИТЕЛЬНО<br />ВОЙТИ
            </div>

            <div className="spc double" />

            <div className={style.inputs}>
              <TextInput
                label="Логин"
                value={username}
                onChange={this.changeField('username')}
              />

              <div className="gap" />

              <TextInput
                label="Пароль"
                type="password"
                value={password}
                onChange={this.changeField('password')}
              />

              <div className="spc double" />

              <Button onClick={this.sendRequest}>
                Войти
              </Button>

              {
                error &&
                <React.Fragment>
                  <div className="spc" />
                  <Info>
                    {error}
                  </Info>
                </React.Fragment>
              }
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = ({ user: { form_state: { login }}}: { user: IUserState }) => ({ ...login });
const mapDispatchToProps = dispatch => bindActionCreators({
  userSendLoginRequest,
  userSetLoginError,
}, dispatch);

export const LoginForm = connect(mapStateToProps, mapDispatchToProps)(Component);
