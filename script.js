/* =====================================================
   CONECTÁ TRABAJO
   JAVASCRIPT + SUPABASE
===================================================== */


/* =====================================================
   CONFIGURACIÓN SUPABASE

   ⚠️ REEMPLAZAR ESTOS DOS VALORES
===================================================== */

const SUPABASE_URL =
    "https://ydbkhrdfdgamaookeqnx.supabase.co";


const SUPABASE_KEY =
    "sb_publishable_XDKWXa2eYPJvS8Ef6OxNmg_kvrE1HAg";


/* =====================================================
   CREAR CLIENTE SUPABASE
===================================================== */

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* =====================================================
   ELEMENTOS HTML
===================================================== */

const formulario =
    document.getElementById("formOferta");


const contenedorOfertas =
    document.getElementById("contenedorOfertas");


const busqueda =
    document.getElementById("busqueda");


const filtroCategoria =
    document.getElementById("filtroCategoria");


const cantidadOfertas =
    document.getElementById("cantidadOfertas");


const sinResultados =
    document.getElementById("sinResultados");


const cargando =
    document.getElementById("cargando");


const btnEnviar =
    document.getElementById("btnEnviar");


const mensajeError =
    document.getElementById("mensajeError");


const modal =
    document.getElementById("modal");


const cerrarModal =
    document.getElementById("cerrarModal");


const irOfertas =
    document.getElementById("irOfertas");



/* =====================================================
   CARGAR OFERTAS DESDE SUPABASE
===================================================== */

async function cargarOfertas() {

    cargando.style.display = "block";

    contenedorOfertas.innerHTML = "";

    sinResultados.style.display = "none";


    const { data, error } =

        await supabaseClient

            .from("ofertas")

            .select("*")

            .eq("activa", true)

            .order(
                "fecha_publicacion",
                {
                    ascending: false
                }
            );


    cargando.style.display = "none";


    if (error) {

        console.error(error);

        contenedorOfertas.innerHTML = `

            <div class="error-base">

                ⚠️

                <h3>
                    No pudimos cargar las ofertas
                </h3>

                <p>
                    Revisá la configuración de Supabase.
                </p>

            </div>

        `;

        return;

    }


    cantidadOfertas.textContent =
        data.length;


    mostrarOfertas(data);

}



/* =====================================================
   MOSTRAR OFERTAS
===================================================== */

function mostrarOfertas(ofertas) {

    contenedorOfertas.innerHTML = "";


    const texto =
        busqueda.value
            .toLowerCase()
            .trim();


    const categoria =
        filtroCategoria.value;


    const filtradas =
        ofertas.filter(
            function(oferta) {


                const textoOferta =

                    `${oferta.puesto}
                    ${oferta.empresa}
                    ${oferta.descripcion}
                    ${oferta.localidad || ""}`
                        .toLowerCase();


                const coincideTexto =
                    textoOferta.includes(texto);


                const coincideCategoria =

                    categoria === "todas"

                    ||

                    oferta.categoria === categoria;


                return (
                    coincideTexto &&
                    coincideCategoria
                );

            }
        );


    if (filtradas.length === 0) {

        sinResultados.style.display =
            "block";

        return;

    }


    sinResultados.style.display =
        "none";


    filtradas.forEach(
        function(oferta) {

            crearTarjeta(oferta);

        }
    );

}



/* =====================================================
   CREAR TARJETA
===================================================== */

function crearTarjeta(oferta) {

    const tarjeta =
        document.createElement("article");


    tarjeta.className =
        "oferta";


    const fecha =
        formatearFecha(
            oferta.fecha_publicacion
        );


    const telefono =
        limpiarTelefono(
            oferta.whatsapp
        );


    const mensaje =

        encodeURIComponent(

            `Hola, vi la oferta de trabajo de ${oferta.puesto} publicada en Conectá Trabajo y quisiera recibir más información.`

        );


    tarjeta.innerHTML = `

        <span class="categoria">

            ${escapeHTML(oferta.categoria)}

        </span>


        <h3>

            ${escapeHTML(oferta.puesto)}

        </h3>


        <div class="empresa">

            🏢
            ${escapeHTML(oferta.empresa)}

        </div>


        <p class="descripcion">

            ${escapeHTML(oferta.descripcion)}

        </p>


        <div class="datos-oferta">


            ${
                oferta.localidad
                ?

                `

                <span class="dato">

                    📍
                    ${escapeHTML(
                        oferta.localidad
                    )}

                </span>

                `

                :

                ""

            }


            <span class="dato">

                💼
                ${escapeHTML(
                    oferta.tipo_trabajo
                )}

            </span>


        </div>


        <div class="fecha">

            📅 Publicado el ${fecha}

        </div>


        <div class="botones-oferta">


            <a

                class="btn-whatsapp"

                href="https://wa.me/${telefono}?text=${mensaje}"

                target="_blank"

                rel="noopener noreferrer"

            >

                💬 Contactar por WhatsApp

            </a>


        </div>

    `;


    contenedorOfertas.appendChild(
        tarjeta
    );

}



/* =====================================================
   PUBLICAR OFERTA
===================================================== */

formulario.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        mensajeError.textContent =
            "";


        btnEnviar.disabled =
            true;


        btnEnviar.textContent =
            "Publicando... ⏳";


        const nuevaOferta = {

            puesto:
                document
                    .getElementById("puesto")
                    .value
                    .trim(),

            empresa:
                document
                    .getElementById("empresa")
                    .value
                    .trim(),

            categoria:
                document
                    .getElementById("categoria")
                    .value,

            localidad:
                document
                    .getElementById("localidad")
                    .value
                    .trim(),

            descripcion:
                document
                    .getElementById("descripcion")
                    .value
                    .trim(),

            tipo_trabajo:
                document
                    .getElementById("tipoTrabajo")
                    .value,

            whatsapp:
                document
                    .getElementById("whatsapp")
                    .value
                    .trim(),

            activa: true

        };


        const { error } =

            await supabaseClient

                .from("ofertas")

                .insert([
                    nuevaOferta
                ]);


        btnEnviar.disabled =
            false;


        btnEnviar.textContent =
            "Publicar oferta 🚀";


        if (error) {

            console.error(error);


            mensajeError.textContent =

                "No se pudo publicar la oferta. " +
                "Revisá la configuración de Supabase.";


            return;

        }


        formulario.reset();


        await cargarOfertas();


        modal.classList.add(
            "activo"
        );

    }
);



/* =====================================================
   BUSCADOR
===================================================== */

busqueda.addEventListener(
    "input",
    cargarOfertas
);


filtroCategoria.addEventListener(
    "change",
    cargarOfertas
);



/* =====================================================
   WHATSAPP
===================================================== */

function limpiarTelefono(numero) {

    return numero
        .replace(/\D/g, "");

}



/* =====================================================
   FECHA
===================================================== */

function formatearFecha(fecha) {

    const fechaObjeto =
        new Date(fecha);


    return fechaObjeto.toLocaleDateString(
        "es-AR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );

}



/* =====================================================
   PROTECCIÓN HTML
===================================================== */

function escapeHTML(texto) {

    const div =
        document.createElement("div");


    div.textContent =
        texto || "";


    return div.innerHTML;

}



/* =====================================================
   MODAL
===================================================== */

cerrarModal.addEventListener(
    "click",
    function() {

        modal.classList.remove(
            "activo"
        );

    }
);


irOfertas.addEventListener(
    "click",
    function() {

        modal.classList.remove(
            "activo"
        );


        document
            .getElementById("ofertas")
            .scrollIntoView({
                behavior: "smooth"
            });

    }
);


modal.addEventListener(
    "click",
    function(event) {

        if (
            event.target === modal
        ) {

            modal.classList.remove(
                "activo"
            );

        }

    }
);



/* =====================================================
   INICIAR PÁGINA
===================================================== */

cargarOfertas();
