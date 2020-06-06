import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  StyleSheet, View, Text, YellowBox, Image, ScrollView,
  TextInput, TouchableOpacity, TouchableWithoutFeedback, FlatList
} from 'react-native';
import firebase from '../config/firebase';
import api from '../services/axios';
import axios from 'axios';

export default function Chat() {

  const [user, setUser] = useState(null)
  const [mensagens, setMensagens] = useState([])
  const [caixaTexto, setCaixaTexto] = useState('')
  const [scrollview, setScrollview] = useState('')
  const [teste, setTeste] = useState('')
  const [loading, setLoading] = useState(false)

  // let mensagens_enviadas = []
  const salvar = () => {
    // dont send empty messages
    if (!caixaTexto || loading) return

    // Start loading
    setLoading(true)

    api.post('/enviarMensagem', {
      mensagem: caixaTexto,
      usuario: user.name,
      avatar: user.picture,
    })
      .then(function (r) {
        // setMensagens([...mensagens, caixaTexto])
        setCaixaTexto('')
        scrollview.scrollToEnd({ animated: true })
      }).catch(function () {

      }).finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    carregaUsuarioAnonimo()
    const db = firebase.firestore()
    let mensagens_enviadas = []
    const unsubscribe = db.collection("chats")
      .doc("sala_01").collection('mensagens')
      .onSnapshot({ includeMetadataChanges: false }, function (snapshot) {
        snapshot.docChanges().forEach(function (change) {
          if (change.type === "added") {
            const { mensagem, usuario, avatar } = change.doc.data()
            const id = change.doc.id
            mensagens_enviadas.push({ mensagem, usuario, avatar, id })
          }
        })
        setMensagens(mensagens_enviadas)
        if (scrollview) {
          setTimeout(() => {
            scrollview.scrollToEnd()
          })
        }
      })
    return () => {
      unsubscribe()
    }
  }, [])

  const carregaUsuarioAnonimo = () => {
    axios.get('https://randomuser.me/api/')
      .then(function (response) {
        const user = response.data.results[0];
        // setDistance(response.data.distance)
        setUser({
          name: `${user.name.first} ${user.name.last}`,
          picture: user.picture.large
        })
        // console.log('user', user)
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  const boldMsg = (msg) => {
    if (typeof msg !== 'string') return <Text>{'Empty!'}</Text>

    var msgs = []
    var bolds = []

    var b = null;
    var e = null;
    while(true) {
      let index = msg.indexOf("*")
      if (index === -1) {
        if (b !== null) {
          msgs.push("*" + msg);
          bolds.push(false);
        }
        break;
      };

      if (b === null) {
        b = index;
        msgs.push(msg.substring(0, b));
        bolds.push(false);
        msg = msg.substr(b + 1);
      } else {
        e = index;
        msgs.push(msg.substring(0, e));
        bolds.push(true);
        msg = msg.substr(e + 1);
        e = null;
        b = null;
      }      
    }

    if (msgs.length === 0 ) {
      return <Text>{msg}</Text>
    }
    return msgs.map((m, i) => (
      <Text key={i} style={{ fontWeight: bolds[i] ? 'bold' : 'normal' }}>{m}</Text>
    ))

  }

  return (
    <View style={styles.view}>

      {user &&
        <>
          <TouchableOpacity onPress={carregaUsuarioAnonimo}>

            <Image
              style={styles.avatar}
              source={{ uri: user.picture }} />
          </TouchableOpacity>

          <Text style={styles.nome_usuario}>{user.name}</Text>
        </>

      }



      <ScrollView style={styles.scrollview} ref={(view) => { setScrollview(view) }}>
        {
          mensagens.slice(-20).map(item => (

            <View key={item.id} style={styles.linha_conversa}>
              <Image style={styles.avatar_conversa} source={{ uri: item.avatar }} />
              <View style={{ flexDirection: 'column', marginTop: 5 }}>
                <Text style={{ fontSize: 12, color: '#999' }}>{item.usuario}</Text>
                {boldMsg(item.mensagem)}
                {/* <Text>{typeof item.mensagem === 'string' ? item.mensagem : 'Empty!'}</Text> */}
              </View>
            </View>
          ))
        }
      </ScrollView>

      {/* <FlatList
        ref={(view) => { setScrollview(view) }}
        style={styles.scrollView}
        data={mensagens}
        inverted={-1}
        renderItem={({ item }) => (
          <View style={styles.linha_conversa}>
              <Image style={styles.avatar_conversa} source={{ uri: item.avatar }} />
              <View style={{ flexDirection: 'column', marginTop: 5 }}>
                <Text style={{ fontSize: 12, color: '#999' }}>{item.usuario}</Text>
                <Text>{typeof item.mensagem === 'string' ? item.mensagem : 'Empty!'}</Text>
              </View>
            </View>
        )}
        keyExtractor={item => item.id}
      /> */}


      <View style={styles.footer}>
        <TextInput
          style={styles.input_mensagem}
          onChangeText={text => setCaixaTexto(text)}
          value={caixaTexto} />

        <TouchableOpacity onPress={salvar} onp>
          <Ionicons style={{ margin: 3 }} name={loading ? "md-refresh" : "md-send"} size={32} color={'#999'} />
        </TouchableOpacity>
      </View>



    </View>)
}

const styles = StyleSheet.create({
  view: {
    flex: 1,
    alignItems: 'center',
    alignContent: 'center',
    width: '100%',
    paddingTop: 50,
    borderBottomWidth: 1,
    borderColor: '#000'
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#333'
  },

  avatar_conversa: {
    width: 40,
    height: 40,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#333',
    marginRight: 10
  },

  nome_usuario: {
    fontSize: 25,
    color: '#999'
  },

  footer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    height: 50
  },
  input_mensagem: {
    borderColor: '#e6e6e6',
    borderWidth: 1,
    flex: 1,
    borderRadius: 4,
    margin: 10,
    marginTop: 0,
    padding: 4
  },
  scrollView: {
    backgroundColor: '#fff',
    width: '100%',
    borderTopColor: '#e6e6e6',
    borderTopWidth: 1,
  },
  linha_conversa: {
    flexDirection: 'row',
    paddingLeft: 10,
    paddingTop: 10,
    marginRight: 60,
  }
})
