/*
 * Copyright (c) 2020-present, salesforce.com, inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided
 * that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice, this list of conditions and the
 * following disclaimer.
 *
 * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and
 * the following disclaimer in the documentation and/or other materials provided with the distribution.
 *
 * Neither the name of salesforce.com, inc. nor the names of its contributors may be used to endorse or
 * promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
 * PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 * TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    Button
} from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import {oauth, net} from 'react-native-force';

class ContactListScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {loggedIn: false, data: []};
    }

    componentDidMount() {
        console.log("componentDidMount called"); 
        this.updateLoginLogout()         
        this.fetchData();
    }

    componentDidUpdate() {
        this.updateLoginLogout()
    }

    updateLoginLogout() {
        this.props.navigation.setOptions({
            headerRight: () => this.state.loggedIn 
                ? (<Button onPress={() => this.onLogout()} title="Logout"/>)
                : (<Button onPress={() => this.onLogin()} title="Login"/>)
        }); 
    }
    
    fetchData() {
        console.log("fetchData called");
        net.query('SELECT Id, Name FROM Contact LIMIT 100',
                  (response) => {
                      console.log("soql query completed");
                      this.setState({loggedIn: true, data: response.records})
                  },
                  (error) => {
                      console.log("error: " + error);
                      this.setState({loggedIn: false, data: []});
                  });
    }

    onLogin() {
        console.log("onLogin called");
        oauth.authenticate(
            () => {
                console.log("login completed");
                this.fetchData()
            },
            (error) => console.log('login failed:' + error)
        );        
    }
    
    onLogout() {
        console.log("onLogout called");
        oauth.logout(() => {
            console.log("logout completed");
            this.setState({loggedIn: false, data: []});
        });
    }

    render() {
        return (
            <View style={styles.container}>
              <FlatList
                data={this.state.data}
                renderItem={({item}) => <Text style={styles.item}>{item.Name}</Text>}
                keyExtractor={(item, index) => 'key_' + index}
              />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 22,
        backgroundColor: 'white',
    },
    item: {
        padding: 10,
        fontSize: 18,
        height: 44,
    }
});

const Stack = createStackNavigator();

export const App = function() {
    return (
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Mobile SDK Sample App" component={ContactListScreen} />
          </Stack.Navigator>
        </NavigationContainer>
    );
}