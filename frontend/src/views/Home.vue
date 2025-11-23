<template>
    <div class="home">
        <h1>Home Page</h1>
        <p>Welcome to the home page!</p>
        <router-link to="/about">Go to About</router-link>

        <section class="spacer"></section>

        <!-- SECTION 1 -->
        <h2>Latest News</h2>
        <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras
            bibendum augue id ultricies pharetra. Curabitur nec hendrerit dolor,
            non aliquet lacus. Phasellus porttitor tellus vel justo tristique,
            non gravida mi mattis. Integer non ullamcorper ex, a iaculis augue.
            Donec viverra felis eget nulla congue, id varius nulla tempus.
            Pellentesque vel massa sed est hendrerit iaculis at et lorem.
            Phasellus justo ipsum, scelerisque ac leo in, blandit blandit ipsum.
            Vestibulum felis magna, accumsan non suscipit vitae, consequat ut
            nisl.
        </p>
        <p>
            Nam arcu mauris, consequat sed cursus id, euismod a sapien. Nam
            pretium ultrices sapien, sit amet placerat nisl varius vitae. Cras
            placerat dui ac urna molestie fermentum. Sed consequat dignissim
            aliquet. Integer dictum vestibulum velit, eget lobortis nisl
            pellentesque a. Mauris vel lorem lobortis, feugiat sem ac, vulputate
            sem. Integer interdum scelerisque dolor, eget facilisis tortor
            scelerisque sed. Quisque id porta mauris.
        </p>

        <section class="spacer"></section>

        <!-- SECTION 2 -->
        <h2>Featured Articles</h2>
        <p>
            Cras finibus, ipsum non suscipit interdum, dolor sapien volutpat
            velit, vitae rutrum erat lacus eget arcu. Mauris magna sem, tempor
            et pharetra non, rhoncus sed velit. Vivamus dictum arcu id dolor
            dictum, eget gravida tortor malesuada. Aenean in lectus quis est
            commodo imperdiet a ut tellus. Sed pharetra magna quis erat feugiat
            feugiat. Suspendisse sed lacinia lectus. Donec pharetra ligula at
            elit volutpat, ut vestibulum turpis convallis.
        </p>
        <p>
            Fusce imperdiet vulputate dignissim. Curabitur hendrerit malesuada
            lorem sit amet semper. Cras et velit vel libero porttitor volutpat
            eget id magna. Aliquam vulputate ipsum id dui pretium pretium. Sed
            condimentum ante mi, vel commodo justo maximus in. Phasellus nec
            orci facilisis, egestas lorem id, euismod purus.
        </p>
        <p>
            Vestibulum efficitur, sapien vel scelerisque pulvinar, elit nisl
            malesuada libero, vitae tincidunt libero mi non tellus. Etiam at
            malesuada velit. Suspendisse potenti. In id mauris volutpat, commodo
            sem et, suscipit augue. Aliquam erat volutpat. Etiam aliquet ipsum
            eu massa tristique, non efficitur leo vulputate.
        </p>

        <section class="spacer"></section>

        <!-- SECTION 3 -->
        <h2>Community Updates</h2>
        <p>
            Vivamus fermentum varius tortor vel facilisis. In venenatis magna
            quis aliquet viverra. Praesent vel ultrices felis, in aliquet purus.
            Vivamus non porta elit. Maecenas euismod, urna a suscipit pulvinar,
            lacus est gravida lorem, vel facilisis nibh nisi sit amet sem.
            Vivamus pretium maximus diam sit amet viverra. Integer facilisis
            mauris sit amet malesuada blandit. Sed feugiat purus ipsum, id
            dictum ipsum interdum sed.
        </p>

        <p>
            Nullam dignissim mauris vel ullamcorper pretium. Suspendisse
            potenti. Fusce sit amet dapibus ipsum. Ut posuere turpis eget sapien
            volutpat, vel sodales nisi ultricies. Sed nulla neque, consectetur
            nec justo at, convallis ornare erat. Nulla facilisi. Aliquam
            interdum varius consectetur. Proin porta volutpat tortor, sed
            gravida elit posuere id. Nam arcu lorem, bibendum vitae pharetra et,
            auctor sed tellus.
        </p>

        <p>
            Nam bibendum condimentum justo eget tincidunt. Fusce condimentum
            mauris odio, at feugiat tortor blandit id. Suspendisse sit amet
            lectus fermentum, sagittis tortor id, dapibus sapien. Donec vitae
            tortor nec lorem elementum varius. Mauris vel ligula ut lacus
            viverra suscipit a ac felis.
        </p>

        <section class="spacer"></section>

        <!-- SECTION 4 -->
        <h2>More Info</h2>
        <p>
            Proin molestie viverra sapien, non feugiat magna iaculis sit amet.
            Sed ut dui id velit consectetur porttitor sed ac sapien. Suspendisse
            potenti. Maecenas nec ipsum volutpat, varius mi ut, consectetur
            erat. In eget nisl nec urna consequat malesuada. Quisque sodales sed
            mauris in tincidunt. In condimentum lacus eget dui placerat, nec
            laoreet nunc tempus. Curabitur sed erat semper, convallis ante quis,
            imperdiet leo.
        </p>

        <p>
            Morbi commodo pretium justo, vitae sodales augue vestibulum
            scelerisque. Nunc ut enim vel est tincidunt suscipit vitae nec
            turpis. Integer dignissim fermentum ante eget finibus. Curabitur nec
            egestas nibh, sit amet finibus ipsum. Nullam id mauris sed velit
            gravida facilisis nec a dui. Ut facilisis vestibulum orci vel
            molestie.
        </p>

        <p>
            Donec condimentum laoreet arcu, sed congue justo congue ac. Sed
            vulputate pellentesque lorem, vitae aliquam lorem scelerisque et.
            Aliquam ornare risus in nisl luctus dictum. Duis euismod diam at
            purus porttitor, ut viverra metus imperdiet.
        </p>

        <p>
            Sed lobortis, enim ac ultrices placerat, ipsum metus finibus urna,
            eu semper sapien leo sed orci. Nulla facilisi. Cras non sagittis
            est, ut consectetur diam. Suspendisse ac malesuada elit. Nullam
            accumsan justo sit amet nulla tempus tristique.
        </p>
    </div>
</template>

<script setup>
// no logic needed for now
</script>

<style scoped>
.home {
    padding: 4px 0; /* the card container already has padding */
}

.spacer {
    height: 28px;
}
</style>
